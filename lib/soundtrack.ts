/**
 * Background music: "Enlivening" by Pufino (Free To Use), played from /music/enlivening.mp3.
 *
 * How it behaves:
 * - It starts by itself as soon as the browser allows. Browsers block sound until the visitor
 *   has interacted with the page, so in most browsers the first touch anywhere on the page
 *   (a tap, a click, or a key press) switches it on. Where the browser already allows sound,
 *   it starts on arrival. It fades in softly and loops for as long as they stay.
 * - Switching to another tab, another site or another app fades it out and pauses it; coming
 *   back fades it in again where it left off.
 * - The music button in the top bar turns it off for the rest of the visit. Every new visit
 *   starts with music on again.
 * - The button only shows "on" while music is actually playing.
 * - On phones the lock screen shows the track name, with play and pause.
 */

type Listener = () => void;
type State = "on" | "off" | "waiting";

const SRC = "/music/enlivening.mp3";
const VOLUME = 0.45; // background level
const FADE_MS = 900;
const STORAGE_KEY = "rk-sound";

class Soundtrack {
  private audio: HTMLAudioElement | null = null;
  private wired = false;
  /** the visitor wants music (on by default for every visit) */
  private wanted = true;
  /** paused because the page is in the background */
  private away = false;
  /** played at least once on this page (so the browser will let it resume) */
  private started = false;
  private playing = false;
  private waitingForGesture = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private listeners = new Set<Listener>();

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  isPlaying = () => this.wanted && this.playing;

  /** "on", "off", or "waiting" (on, but the browser is waiting for the first click or tap) */
  getState = (): State => (this.isPlaying() ? "on" : this.wanted && !this.started ? "waiting" : "off");

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private remember(on: boolean) {
    try {
      sessionStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* storage blocked: the button still works for this page */
    }
  }

  /** Called once the page is in the browser (safe to call many times) */
  init() {
    if (this.wired || typeof window === "undefined") return;
    this.wired = true;

    try {
      this.wanted = sessionStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      this.wanted = true;
    }

    const audio = new Audio();
    audio.src = SRC;
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.addEventListener("playing", () => {
      this.playing = true;
      this.started = true;
      this.emit();
    });
    audio.addEventListener("pause", () => {
      this.playing = false;
      this.emit();
    });
    // the phone or browser paused it on its own (a call, headphones unplugged): pick up again on the next tap
    audio.addEventListener("pause", () => {
      if (this.wanted && !this.away && !document.hidden) this.armGesture();
    });
    this.audio = audio;
    this.setupMediaSession();

    // another tab, site or app: fade out; back on the site: fade back in
    document.addEventListener("visibilitychange", () => (document.hidden ? this.goAway() : this.comeBack()));
    window.addEventListener("pagehide", () => this.goAway());
    window.addEventListener("pageshow", () => {
      if (!document.hidden) this.comeBack();
    });

    if (this.wanted) {
      // try straight away (works where the browser already allows sound); otherwise wait for the first interaction
      void this.play().then((ok) => {
        if (!ok) this.armGesture();
      });
    }
    this.emit();
  }

  /** Lock-screen / headset controls on phones and laptops */
  private setupMediaSession() {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: "Enlivening", artist: "Pufino", album: "Rasendriya Khansa, portfolio" });
      navigator.mediaSession.setActionHandler("play", () => this.toggleTo(true));
      navigator.mediaSession.setActionHandler("pause", () => this.toggleTo(false));
    } catch {
      /* not supported: nothing to set up */
    }
  }

  /** Start (or resume) playing with a fade-in. Resolves false if the browser said no. */
  private async play(): Promise<boolean> {
    const audio = this.audio;
    if (!audio || !this.wanted || this.away || document.hidden) return false;
    try {
      await audio.play();
      this.fadeTo(VOLUME);
      return true;
    } catch {
      return false;
    }
  }

  /** Fade out, then pause */
  private pause() {
    const audio = this.audio;
    if (!audio) return;
    this.fadeTo(0, () => audio.pause());
  }

  /** Smooth volume change (phones that don't allow volume changes, like iPhones, simply start and stop) */
  private fadeTo(target: number, done?: () => void) {
    const audio = this.audio;
    if (!audio) return;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    const from = audio.volume;
    const steps = Math.max(1, Math.round(FADE_MS / 30));
    let i = 0;
    this.fadeTimer = setInterval(() => {
      i++;
      const v = from + (target - from) * (i / steps);
      try {
        audio.volume = Math.min(1, Math.max(0, v));
      } catch {
        /* volume is fixed on this device */
      }
      if (i >= steps) {
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
        done?.();
      }
    }, 30);
  }

  /** Wait for the next click, tap or key press: the moments browsers accept as permission to play sound */
  private armGesture() {
    if (this.waitingForGesture) return;
    this.waitingForGesture = true;
    // every kind of touch the browser accepts as permission: a mouse press, the end of a finger
    // or pen tap, a click, or a key press. Listened to before anything else on the page, so a
    // tap on a link, a button or empty space all count.
    const events = ["pointerdown", "pointerup", "touchend", "click", "keydown"] as const;
    const onGesture = (e: Event) => {
      // the music button handles its own click
      if (e.target instanceof Element && e.target.closest("[data-sound-toggle]")) return;
      if (e instanceof PointerEvent && e.type === "pointerdown" && e.pointerType !== "mouse") return;
      if (e instanceof PointerEvent && e.type === "pointerup" && e.pointerType === "mouse") return;
      if (e instanceof KeyboardEvent && (e.key === "Escape" || e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey)) return;
      if (!this.wanted || this.isPlaying()) {
        stop();
        return;
      }
      // play() must be called right here, inside the visitor's action
      void this.play().then((ok) => {
        if (ok) stop();
      });
    };
    const stop = () => {
      events.forEach((t) => window.removeEventListener(t, onGesture, true));
      this.waitingForGesture = false;
    };
    events.forEach((t) => window.addEventListener(t, onGesture, true));
  }

  private goAway() {
    if (this.away) return;
    this.away = true;
    if (this.audio && !this.audio.paused) this.pause();
  }

  private comeBack() {
    if (!this.away) return;
    this.away = false;
    if (!this.wanted) return;
    void this.play().then((ok) => {
      if (!ok) this.armGesture();
    });
  }

  private toggleTo(on: boolean) {
    this.wanted = on;
    this.remember(on);
    if (on) {
      this.away = false;
      void this.play().then((ok) => {
        if (!ok) this.armGesture();
      });
    } else {
      this.pause();
    }
    this.emit();
  }

  /** The music button in the top bar */
  toggle() {
    this.init();
    this.toggleTo(!this.isPlaying());
  }
}

// One player for the whole page, kept across hot reloads while developing so two never play at once
const store = globalThis as typeof globalThis & { __rkMusicV3?: Soundtrack };
export const soundtrack = store.__rkMusicV3 ?? (store.__rkMusicV3 = new Soundtrack());
