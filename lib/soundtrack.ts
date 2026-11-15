/**
 * A small generative soundtrack, made live with the Web Audio API (no audio file to load).
 *
 * D minor, about 70 BPM: warm detuned pads move through Dm9, Bbmaj7, Fadd9 and Csus2,
 * a sine bass sits under each chord, a soft low pulse marks every bar, and a sparse
 * plucked line wanders over the top, never the same twice. Everything goes through a
 * generated hall reverb. The pads open up (brighter filter) the further down the page
 * you are.
 *
 * Reliability rules this engine follows:
 * - Only the visitor starts it (browsers block sound until a real click, tap or key press),
 *   and the button only shows "on" while sound is actually running.
 * - It keeps playing in the background (it's background music); it only stops when the
 *   visitor turns it off.
 * - Every start is a fresh "session" with its own volume control, so notes left over from a
 *   quick off-and-on can never pile up on top of the new ones.
 * - If the scheduler falls behind (busy phone, sleeping laptop), it skips ahead instead of
 *   firing all the missed notes at once.
 * - If the browser or the phone interrupts the audio (call, lock screen, headphones
 *   unplugged), it picks up again on the next touch or click.
 */

type Listener = () => void;

const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const VOLUME = 0.55;
const LOOKAHEAD = 2; // seconds of music scheduled ahead of time
const STORAGE_KEY = "rk-sound";

// MIDI notes: pad voicing and bass root for each chord, two bars each
const CHORDS: { pad: number[]; bass: number }[] = [
  { pad: [50, 53, 57, 64], bass: 38 }, // Dm9
  { pad: [50, 53, 57, 58], bass: 34 }, // Bbmaj7 (over Bb)
  { pad: [53, 57, 60, 67], bass: 41 }, // Fadd9
  { pad: [48, 55, 62, 64], bass: 36 }, // Csus2 with the 3rd on top
];
// D minor pentatonic for the plucked line
const PLUCK_NOTES = [62, 65, 67, 69, 72, 74, 77];

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** Where a session's notes enter the shared mix; muting these silences that session's notes */
type Session = { pad: GainNode; wet: GainNode; dry: GainNode };

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
  /** the visitor wants music */
  private wanted = false;
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

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private remember(on: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
    } catch {
      /* storage can be blocked; the toggle still works for this visit */
    }
  }

  private wantsSound() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "on";
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

    // Visitors who left the music on last time get it back on their first real interaction
    if (this.wantsSound()) {
      this.wanted = true;
      this.armGesture();
    }

    // Coming back to the tab or the phone: make sure audio is still flowing
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) this.ensureRunning();
    });
    window.addEventListener("pageshow", () => this.ensureRunning());

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

  /** Wait for the next click, tap or key press, which browsers accept as permission to play sound */
  private armGesture() {
    if (this.waitingForGesture) return;
    this.waitingForGesture = true;
    const events = ["click", "touchend", "keydown"] as const;
    const onGesture = (e: Event) => {
      // the music button handles its own click
      if (e.target instanceof Element && e.target.closest("[data-sound-toggle]")) return;
      if (e instanceof KeyboardEvent && (e.key === "Escape" || e.key === "Tab" || e.metaKey || e.ctrlKey || e.altKey)) return;
      events.forEach((t) => window.removeEventListener(t, onGesture, true));
      this.waitingForGesture = false;
      if (this.wanted && !this.isPlaying()) this.start();
    };
    events.forEach((t) => window.addEventListener(t, onGesture, true));
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
      if (!isRunning && this.wanted && !document.hidden && !this.suspendTimer) this.ensureRunning();
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
    const wet = ctx.createGain();
    const dry = ctx.createGain();
    pad.connect(this.padFilter!);
    wet.connect(this.bus!);
    dry.connect(this.master!);
    return { pad, wet, dry };
  }

  /** Silence a session's leftover notes, then unplug it */
  private endSession(s: Session | null, fade: number) {
    if (!s || !this.ctx) return;
    const now = this.ctx.currentTime;
    [s.pad, s.wet, s.dry].forEach((g) => {
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0, now + fade);
    });
    setTimeout(() => [s.pad, s.wet, s.dry].forEach((g) => g.disconnect()), (fade + 0.2) * 1000);
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

  private pad(s: Session, notes: number[], at: number, length: number) {
    const ctx = this.ctx!;
    const attack = 2.4;
    const release = 3.2;
    notes.forEach((n) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.045, at + attack);
      g.gain.setValueAtTime(0.045, at + length);
      g.gain.linearRampToValueAtTime(0, at + length + release);
      g.connect(s.pad);
      [-7, 7].forEach((cents) => this.osc("sawtooth", hz(n), at, at + length + release + 0.1, g, cents));
    });
  }

  private bass(s: Session, note: number, at: number, length: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.2, at + 0.6);
    g.gain.setValueAtTime(0.2, at + length - 0.4);
    g.gain.linearRampToValueAtTime(0, at + length + 0.6);
    g.connect(s.dry);
    this.osc("sine", hz(note), at, at + length + 0.7, g);
  }

  /** A soft, low heartbeat on the first beat of every bar */
  private pulse(s: Session, at: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
    g.connect(s.dry);
    const o = this.osc("sine", 92, at, at + 0.6, g);
    o.frequency.setValueAtTime(92, at);
    o.frequency.exponentialRampToValueAtTime(44, at + 0.35);
  }

  private pluck(s: Session, note: number, at: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.07, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2600;
    g.connect(f).connect(s.wet);
    this.osc("triangle", hz(note), at, at + 1.5, g);
  }

  private scheduleBar(s: Session, bar: number, at: number) {
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
    if (bar % 2 === 0) {
      this.pad(s, chord.pad, at, BAR * 2);
      this.bass(s, chord.bass, at, BAR * 2);
    }
    this.pulse(s, at);
    // the plucked line: a few eighth notes per bar, never the same pattern twice
    for (let step = 0; step < 8; step++) {
      const chance = step === 0 ? 0.15 : step % 2 === 0 ? 0.32 : 0.18;
      if (Math.random() < chance) this.pluck(s, PLUCK_NOTES[Math.floor(Math.random() * PLUCK_NOTES.length)], at + step * (BEAT / 2));
    }
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
        if (!this.wanted) return; // turned off again before the audio woke up
        this.running = ctx.state === "running";
        this.emit();
        if (this.running) begin();
        else this.armGesture(); // the browser still says no: try again on the next interaction
      })
      .catch(() => this.armGesture());
  }

  private stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const g = this.master!.gain;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0, now + 1.2);
    this.endSession(this.session, 1.2);
    this.session = null;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => {
      this.suspendTimer = null;
      if (!this.wanted) void ctx.suspend();
    }, 1400);
  }

  /** After coming back to the page, resume if the browser paused the audio meanwhile */
  private ensureRunning() {
    if (!this.wanted || !this.ctx) return;
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

  toggle() {
    if (this.isPlaying()) {
      this.wanted = false;
      this.remember(false);
      this.stop();
      this.running = false;
      this.emit();
    } else {
      this.wanted = true;
      this.remember(true);
      this.start();
    }
  }
}

// One engine for the whole page, kept across hot reloads while developing so two never play at once
const store = globalThis as typeof globalThis & { __rkSoundtrackV2?: Soundtrack };
export const soundtrack = store.__rkSoundtrackV2 ?? (store.__rkSoundtrackV2 = new Soundtrack());
