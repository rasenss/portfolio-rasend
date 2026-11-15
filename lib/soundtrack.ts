/**
 * A small soundtrack in the style of Mozart, played live in the browser (no audio file).
 *
 * An original piece written in the Classical style: a singing right-hand melody over an
 * Alberti bass (the low-high-middle-high left-hand pattern Mozart used everywhere), in
 * C major, Allegretto (about 112 beats a minute). It has a 24-bar form: a theme that ends on a half cadence and
 * then a full cadence, a middle part that moves to G major, and the theme again. Every
 * second time through it plays as a variation, the way Mozart wrote sets of variations:
 * the melody gains little turns and the left hand runs in sixteenths. The piano is
 * synthesised (bright hammer, warm decay), with a soft string pad underneath and a concert
 * hall reverb. The strings open up a little the further down the page you are.
 *
 * How it behaves:
 * - Music is on by default. Browsers never let a page make sound before the visitor
 *   interacts, so it starts on their very first click, tap or key press anywhere on the
 *   page (or straight away, where the browser allows it). The button only shows "on" while
 *   sound is actually playing.
 * - It plays the whole time the visitor is on the site, until they turn it off with the
 *   button. That choice lasts for this visit only: every new visit starts with music on.
 * - Switching to another tab, another site or another app on the phone fades it out;
 *   coming back fades it in again (unless they turned it off).
 * - Every start is a fresh "session" with its own volume control, so notes left over from a
 *   quick off-and-on can never pile up on top of the new ones.
 * - If the scheduler falls behind (busy phone, sleeping laptop), it skips ahead instead of
 *   firing all the missed notes at once.
 * - If the browser or the phone interrupts the audio (call, lock screen, headphones
 *   unplugged), it picks up again on the next touch or click.
 */

type Listener = () => void;

const BPM = 112; // Allegretto: lively, but still relaxed enough for background listening
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const VOLUME = 0.6;
const LOOKAHEAD = 2; // seconds of music scheduled ahead of time
const STORAGE_KEY = "rk-sound";
const FORM = 24; // bars: theme (8), middle part (8), theme again (8)

/* Left hand: Alberti figures (low, high, middle, high) and the string pad for each harmony */
const HARMONY: Record<string, { alberti: number[]; pad: number[] }> = {
  C: { alberti: [48, 55, 52, 55], pad: [48, 55, 64] },
  G7: { alberti: [47, 53, 50, 53], pad: [47, 53, 62] },
  G: { alberti: [43, 50, 47, 50], pad: [43, 55, 62] },
  F: { alberti: [48, 57, 53, 57], pad: [53, 57, 60] },
  D7: { alberti: [48, 54, 50, 54], pad: [50, 54, 60] },
  Am: { alberti: [45, 52, 48, 52], pad: [45, 52, 60] },
};

/** Harmony of each bar; "D7|G" means two beats of each */
const CHORDS_A = ["C", "G7", "C", "G", "C", "F", "G7", "C"];
const CHORDS_B = ["G", "D7", "G", "D7|G", "Am", "D7", "G7", "G7"];

/** Right-hand melody: [beat, length in beats, MIDI note] for each bar */
type Note = [number, number, number];
const MELODY_A: Note[][] = [
  [[0, 2, 72], [2, 1, 76], [3, 1, 79]],
  [[0, 1.5, 77], [1.5, 0.5, 76], [2, 1, 74], [3, 1, 67]],
  [[0, 1, 79], [1, 0.5, 81], [1.5, 0.5, 79], [2, 1, 76], [3, 1, 72]],
  [[0, 1.5, 74], [1.5, 0.25, 76], [1.75, 0.25, 77], [2, 2, 74]],
  [[0, 2, 72], [2, 1, 76], [3, 1, 79]],
  [[0, 2, 81], [2, 1, 84], [3, 1, 81]],
  [[0, 0.5, 79], [0.5, 0.5, 77], [1, 0.5, 76], [1.5, 0.5, 74], [2, 1, 77], [3, 1, 71]],
  [[0, 3, 72]],
];
const MELODY_B: Note[][] = [
  [[0, 2, 83], [2, 0.5, 81], [2.5, 0.5, 79], [3, 0.5, 78], [3.5, 0.5, 79]],
  [[0, 1, 81], [1, 1, 78], [2, 2, 74]],
  [[0, 0.5, 79], [0.5, 0.5, 81], [1, 0.5, 83], [1.5, 0.5, 84], [2, 1, 86], [3, 1, 83]],
  [[0, 1, 81], [1, 1, 84], [2, 2, 83]],
  [[0, 2, 84], [2, 1, 81], [3, 1, 76]],
  [[0, 1, 78], [1, 1, 81], [2, 1, 84], [3, 1, 81]],
  [[0, 2, 79], [2, 0.5, 77], [2.5, 0.5, 76], [3, 0.5, 74], [3.5, 0.5, 77]],
  [[0, 2, 74], [2, 1, 71], [3, 1, 67]],
];

/** Scales for ornaments: C major, and G major (with F sharp) in the middle part */
const C_MAJOR = [0, 2, 4, 5, 7, 9, 11];
const G_MAJOR = [0, 2, 4, 6, 7, 9, 11];
const stepFrom = (note: number, dir: 1 | -1, scale: number[]) => {
  let n = note + dir;
  while (!scale.includes(((n % 12) + 12) % 12)) n += dir;
  return n;
};

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Where a session's notes enter the shared mix; muting these silences that session's notes */
type Session = { pad: GainNode; piano: GainNode };

class Soundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private session: Session | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private nextBarAt = 0;
  private bar = 0;
  /** the visitor wants music (on by default, until they turn it off) */
  private wanted = false;
  /** paused because the page is in the background (another tab, site or app) */
  private away = false;
  /** the music has played at least once on this page, so the browser will let it resume */
  private started = false;
  /** sound is actually coming out */
  private running = false;
  private waitingForGesture = false;
  private listeners = new Set<Listener>();
  private wired = false;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  /** What the button shows: on only while the music is really audible */
  isPlaying = () => this.wanted && this.running;

  /** "on", "off", or "waiting" (on, but waiting for the visitor's first click or tap) */
  getState = (): "on" | "off" | "waiting" => (this.isPlaying() ? "on" : this.wanted && !this.started ? "waiting" : "off");

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private remember(on: boolean) {
    try {
      sessionStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
  }

  /** On unless this visitor turned it off before */
  private wantsSound() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== "off";
    } catch {
      return true;
    }
  }

  /** Whether the browser will let sound start right now, without waiting for a click */
  private canStartNow() {
    const nav = navigator as Navigator & {
      userActivation?: { hasBeenActive: boolean };
      getAutoplayPolicy?: (type: string) => string;
    };
    if (nav.userActivation?.hasBeenActive) return true;
    try {
      return nav.getAutoplayPolicy?.("audiocontext") === "allowed";
    } catch {
      return false;
    }
  }

  /**
   * Called by the button once it's on the page (safe to call many times).
   * Sets up the page-wide listeners exactly once, however many buttons are mounted.
   */
  init() {
    if (this.wired || typeof window === "undefined") return;
    this.wired = true;

    // On by default: start now if the browser allows it, otherwise on the first click or tap
    if (this.wantsSound()) {
      this.wanted = true;
      if (this.canStartNow() && !document.hidden) this.start();
      else this.armGesture();
      this.emit();
    }

    // Another tab, another site, another app: fade out. Back on the site: fade back in.
    document.addEventListener("visibilitychange", () => (document.hidden ? this.goAway() : this.comeBack()));
    window.addEventListener("pagehide", () => this.goAway());
    window.addEventListener("pageshow", () => {
      if (!document.hidden) this.comeBack();
    });

    let frame = 0;
    window.addEventListener(
      "scroll",
      () => {
        if (frame || !this.running) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          this.updateDepth();
        });
      },
      { passive: true },
    );
  }

  /**
   * Wait for the next click, tap or key press: the moments browsers accept as permission to
   * play sound. A mouse press counts straight away; on touch screens it's the end of the tap.
   */
  private armGesture() {
    if (this.waitingForGesture) return;
    this.waitingForGesture = true;
    const events = ["pointerdown", "touchend", "click", "keydown"] as const;
    const onGesture = (e: Event) => {
      // the music button and the welcome screen handle their own clicks
      if (e.target instanceof Element && e.target.closest("[data-sound-toggle], [data-sound-gate]")) return;
      if (e instanceof PointerEvent && e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      if (e instanceof KeyboardEvent && (e.key === "Escape" || e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey)) return;
      events.forEach((t) => window.removeEventListener(t, onGesture, true));
      this.waitingForGesture = false;
      if (this.wanted && !this.isPlaying() && !document.hidden) this.start();
    };
    events.forEach((t) => window.addEventListener(t, onGesture, true));
  }

  /** The page went into the background: fade out quickly and let the audio sleep */
  private goAway() {
    if (this.away) return;
    this.away = true;
    if (this.timer || this.running) {
      this.stop(0.35, true);
      this.running = false;
      this.emit();
    }
  }

  /** Back on the page: fade the music back in, if it's wanted and has played before */
  private comeBack() {
    if (!this.away) return;
    this.away = false;
    if (this.wanted && this.started) this.start();
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;

    // iPhone: play even when the ring/silent switch is on (Safari 17+), like any music player
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) {
      try {
        nav.audioSession.type = "playback";
      } catch {
        /* older Safari: no audio session control */
      }
    }

    const ctx = new Ctx({ latencyHint: "playback" });

    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);

    // dry bus to the master, plus a send into the reverb
    const bus = ctx.createGain();
    bus.gain.value = 0.75;
    bus.connect(master);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 2.8);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    bus.connect(reverb).connect(wet).connect(master);

    // strings: a soft filtered pad that opens up as you scroll down the page
    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 700;
    padFilter.Q.value = 0.6;
    padFilter.connect(bus);

    // the browser or the OS can suspend audio on its own (calls, lock screen, device changes)
    ctx.onstatechange = () => {
      const isRunning = ctx.state === "running";
      if (isRunning !== this.running) {
        this.running = isRunning;
        this.emit();
      }
      if (!isRunning && this.wanted && !this.away && !document.hidden && !this.suspendTimer) this.ensureRunning();
    };

    this.ctx = ctx;
    this.master = master;
    this.bus = bus;
    this.padFilter = padFilter;
    return true;
  }

  /** Stereo decaying noise: a cheap, convincing hall */
  private impulse(ctx: AudioContext, seconds: number) {
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    return buf;
  }

  private newSession(): Session {
    const ctx = this.ctx!;
    const pad = ctx.createGain();
    const piano = ctx.createGain();
    pad.connect(this.padFilter!);
    piano.connect(this.bus!);
    return { pad, piano };
  }

  /** Silence a session's leftover notes, then unplug it */
  private endSession(s: Session | null, fade: number) {
    if (!s || !this.ctx) return;
    const now = this.ctx.currentTime;
    const nodes = [s.pad, s.piano];
    nodes.forEach((g) => {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + fade);
    });
    setTimeout(() => nodes.forEach((g) => g.disconnect()), (fade + 0.2) * 1000);
  }

  private osc(type: OscillatorType, freq: number, at: number, stopAt: number, out: AudioNode, detune = 0) {
    const o = this.ctx!.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    o.connect(out);
    o.start(at);
    o.stop(stopAt);
    o.onended = () => o.disconnect();
    return o;
  }

  /** strings: a soft held chord underneath the piano */
  private pad(s: Session, notes: number[], at: number, length: number) {
    const ctx = this.ctx!;
    notes.forEach((n) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.026, at + 0.9);
      g.gain.setValueAtTime(0.026, at + length);
      g.gain.linearRampToValueAtTime(0, at + length + 1.2);
      g.connect(s.pad);
      [-5, 5].forEach((cents) => this.osc("sawtooth", hz(n), at, at + length + 1.3, g, cents));
    });
  }

  /**
   * A synthesised piano note: a few harmonics, each fading at its own speed (the higher ones
   * faster), a bright hammer attack that mellows as a filter closes, and a soft release.
   */
  private piano(s: Session, note: number, at: number, length: number, velocity: number, level: number) {
    const ctx = this.ctx!;
    const f = hz(note);
    const peak = level * velocity;
    const ring = Math.max(length, 0.25);
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.setValueAtTime(Math.min(9000, f * 9), at);
    tone.frequency.exponentialRampToValueAtTime(Math.max(900, f * 2.5), at + 1.2);
    tone.connect(s.piano);
    const partials: [number, number, number][] = [
      // [harmonic, loudness, how long it rings in seconds]
      [1, 1, 2.6],
      [2.001, 0.42, 1.4],
      [3.003, 0.18, 0.8],
      [4.007, 0.08, 0.45],
    ];
    partials.forEach(([h, amt, decay]) => {
      const g = ctx.createGain();
      const top = peak * amt;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(top, at + 0.005);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0001, top * 0.35), at + Math.min(decay, ring));
      g.gain.setValueAtTime(Math.max(0.0001, top * 0.3), at + ring);
      g.gain.exponentialRampToValueAtTime(0.0001, at + ring + 0.35);
      g.connect(tone);
      this.osc("sine", f * h, at, at + ring + 0.4, g);
    });
  }

  /** Plays one bar of the piece (24-bar form; every second time through as a variation) */
  private scheduleBar(s: Session, bar: number, at: number) {
    const inForm = bar % FORM;
    const variation = Math.floor(bar / FORM) % 2 === 1;
    const middle = inForm >= 8 && inForm < 16;
    const section = inForm % 8;
    const melody = (middle ? MELODY_B : MELODY_A)[section];
    const chords = (middle ? CHORDS_B : CHORDS_A)[section].split("|");
    const scale = middle ? G_MAJOR : C_MAJOR;
    const human = () => (Math.random() - 0.5) * 0.012; // a few milliseconds, like a real player

    // left hand: Alberti bass, eighths in the theme, sixteenths in the variation
    const perBeat = variation ? 4 : 2;
    const notesInBar = 4 * perBeat;
    for (let i = 0; i < notesInBar; i++) {
      const beat = i / perBeat;
      const chord = HARMONY[chords[chords.length > 1 && beat >= 2 ? 1 : 0]];
      const n = chord.alberti[i % 4];
      const vel = (i % perBeat === 0 ? 0.8 : 0.6) + Math.random() * 0.08;
      this.piano(s, n, at + beat * BEAT + human(), BEAT / perBeat, vel, variation ? 0.09 : 0.11);
    }
    // a low root on the first beat of each harmony, for depth
    chords.forEach((name, half) => {
      const root = HARMONY[name].alberti[0] - 12;
      this.piano(s, root, at + half * 2 * BEAT, chords.length > 1 ? 2 * BEAT : 3.5 * BEAT, 0.55, 0.1);
      this.pad(s, HARMONY[name].pad, at + half * 2 * BEAT, (chords.length > 1 ? 2 : 4) * BEAT);
    });

    // right hand: the melody; in the variation, long notes open with a little turn
    melody.forEach(([beat, len, note], i) => {
      const t = at + beat * BEAT + human();
      const vel = (beat === 0 ? 0.95 : 0.8) + Math.random() * 0.08;
      if (variation && len >= 1) {
        const sixteenth = BEAT / 4;
        const turn = [note, stepFrom(note, 1, scale), note, stepFrom(note, -1, scale)];
        turn.forEach((n, k) => this.piano(s, n, t + k * sixteenth, sixteenth, vel * (k === 0 ? 1 : 0.78), 0.21));
        this.piano(s, note, t + BEAT, (len - 1) * BEAT || sixteenth * 2, vel * 0.85, 0.21);
      } else {
        this.piano(s, note, t, len * BEAT, vel, 0.21);
      }
      // the very last note of the theme gets a gentle octave below, to round the cadence
      if (!middle && section === 7 && i === 0) this.piano(s, note - 12, t, len * BEAT, 0.6, 0.14);
    });
  }

  private tick = () => {
    const ctx = this.ctx;
    const s = this.session;
    if (!ctx || !s || ctx.state !== "running") return;
    // fell behind (busy device, laptop woke up): skip what was missed instead of playing it all at once
    if (this.nextBarAt < ctx.currentTime) {
      this.nextBarAt = ctx.currentTime + 0.05;
      if (this.bar % 2 === 1) this.bar++; // restart on a chord change so the pads line up
    }
    while (this.nextBarAt < ctx.currentTime + LOOKAHEAD) {
      this.scheduleBar(s, this.bar, this.nextBarAt);
      this.nextBarAt += BAR;
      this.bar++;
    }
  };

  private updateDepth() {
    if (!this.ctx || !this.padFilter) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, max > 0 ? window.scrollY / max : 0));
    this.padFilter.frequency.setTargetAtTime(650 + p * 1500, this.ctx.currentTime, 0.6);
  }

  /** Begin a fresh session and fade in. Must run inside a click, tap or key press the first time. */
  private start() {
    if (!this.ctx && !this.build()) return;
    const ctx = this.ctx!;
    if (this.suspendTimer) {
      clearTimeout(this.suspendTimer);
      this.suspendTimer = null;
    }

    // a quick off-and-on: mute whatever the previous session still had queued
    this.endSession(this.session, 0.05);
    this.session = this.newSession();

    const begin = () => {
      const now = ctx.currentTime;
      const g = this.master!.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(VOLUME, now + 2.5);
      this.nextBarAt = now + 0.1;
      this.bar = 0;
      this.updateDepth();
      this.tick();
      if (!this.timer) this.timer = setInterval(this.tick, 200);
    };

    const resumed = ctx.state === "running" ? Promise.resolve() : ctx.resume();
    resumed
      .then(() => {
        if (!this.wanted || this.away) return; // turned off, or left the page, before the audio woke up
        this.running = ctx.state === "running";
        if (this.running) this.started = true;
        this.emit();
        if (this.running) begin();
        else this.armGesture(); // the browser still says no: try again on the next interaction
      })
      .catch(() => this.armGesture());
  }

  /** Fade out and stop scheduling; the audio is put to sleep once the fade has finished */
  private stop(fade = 1.2, sleep = false) {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = this.master!.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + fade);
    this.endSession(this.session, fade);
    this.session = null;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      // asleep when turned off or in the background; awake again if it came back meanwhile
      if (!this.wanted || (sleep && this.away)) void ctx.suspend();
    }, (fade + 0.2) * 1000);
  }

  /** After coming back to the page, resume if the browser paused the audio meanwhile */
  private ensureRunning() {
    if (!this.wanted || this.away || !this.ctx) return;
    if (this.ctx.state === "running") {
      if (!this.timer) this.start();
      return;
    }
    this.ctx
      .resume()
      .then(() => {
        if (this.ctx?.state === "running") {
          if (!this.timer || !this.session) this.start();
        } else this.armGesture();
      })
      .catch(() => this.armGesture());
  }

  /**
   * Some browsers already allow sound without a click (the visitor allowed sound for this
   * site, or plays media here often). Find out by opening the audio and seeing if it runs;
   * if it does, the music starts with no click at all.
   */
  tryAutoplay(): boolean {
    if (typeof window === "undefined" || document.hidden) return false;
    if (!this.ctx && !this.build()) return false;
    if (this.ctx!.state !== "running") return false;
    this.enter(true);
    return true;
  }

  /** The welcome screen's choice: "Enter with sound" (runs inside the click, so the browser allows it) or "Enter quietly" */
  enter(withSound: boolean) {
    this.init();
    if (withSound) {
      this.wanted = true;
      this.away = false;
      this.remember(true);
      this.start();
    } else {
      this.wanted = false;
      this.remember(false);
      if (this.timer || this.running) this.stop();
      this.running = false;
      this.emit();
    }
  }

  toggle() {
    if (this.isPlaying()) {
      this.wanted = false;
      this.remember(false);
      this.stop();
      this.running = false;
      this.emit();
    } else {
      this.wanted = true;
      this.away = false;
      this.remember(true);
      this.start();
    }
  }
}

// One engine for the whole page, kept across hot reloads while developing so two never play at once
const store = globalThis as typeof globalThis & { __rkSoundtrackV2?: Soundtrack };
export const soundtrack = store.__rkSoundtrackV2 ?? (store.__rkSoundtrackV2 = new Soundtrack());
