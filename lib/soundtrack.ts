/**
 * A small generative soundtrack, made live with the Web Audio API (no audio file to load).
 *
 * D minor, about 70 BPM: warm detuned pads move through Dm9, Bbmaj7, Fadd9 and Csus2,
 * a sine bass sits under each chord, a soft low pulse marks every bar, and a sparse
 * plucked line wanders over the top, never the same twice. Everything goes through a
 * generated hall reverb. The pads open up (brighter filter) the further down the page
 * you are.
 *
 * Browsers only allow sound after a click or key press, so it never starts by itself:
 * the visitor turns it on, and the choice is remembered for their next visit (it then
 * starts on their first click anywhere).
 */

type Listener = () => void;

const BPM = 70;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;
const VOLUME = 0.55;
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

class Soundtrack {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bus: GainNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private suspendTimer: ReturnType<typeof setTimeout> | null = null;
  private nextBarAt = 0;
  private bar = 0;
  private playing = false;
  private listeners = new Set<Listener>();

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  };

  isPlaying = () => this.playing;

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

  wantsSound() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      return false;
    }
  }

  private build() {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return false;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);

    // everything plays into the bus: dry to the master, and a send into the reverb
    const bus = ctx.createGain();
    bus.gain.value = 0.75;
    bus.connect(master);

    const reverb = ctx.createConvolver();
    reverb.buffer = this.impulse(ctx, 3.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    bus.connect(reverb).connect(wet).connect(master);

    const padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 700;
    padFilter.Q.value = 0.6;
    padFilter.connect(bus);

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

  private pad(notes: number[], at: number, length: number) {
    const ctx = this.ctx!;
    const attack = 2.4;
    const release = 3.2;
    notes.forEach((n) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.045, at + attack);
      g.gain.setValueAtTime(0.045, at + length);
      g.gain.linearRampToValueAtTime(0, at + length + release);
      g.connect(this.padFilter!);
      [-7, 7].forEach((cents) => {
        const o = ctx.createOscillator();
        o.type = "sawtooth";
        o.frequency.value = hz(n);
        o.detune.value = cents;
        o.connect(g);
        o.start(at);
        o.stop(at + length + release + 0.1);
        o.onended = () => o.disconnect();
      });
    });
  }

  private bass(note: number, at: number, length: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.2, at + 0.6);
    g.gain.setValueAtTime(0.2, at + length - 0.4);
    g.gain.linearRampToValueAtTime(0, at + length + 0.6);
    g.connect(this.master!);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = hz(note);
    o.connect(g);
    o.start(at);
    o.stop(at + length + 0.7);
    o.onended = () => o.disconnect();
  }

  /** A soft, low heartbeat on the first beat of every bar */
  private pulse(at: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.55);
    g.connect(this.master!);
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(92, at);
    o.frequency.exponentialRampToValueAtTime(44, at + 0.35);
    o.connect(g);
    o.start(at);
    o.stop(at + 0.6);
    o.onended = () => o.disconnect();
  }

  private pluck(note: number, at: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.07, at + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 1.4);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 2600;
    g.connect(f).connect(this.bus!);
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = hz(note);
    o.connect(g);
    o.start(at);
    o.stop(at + 1.5);
    o.onended = () => o.disconnect();
  }

  private scheduleBar(bar: number, at: number) {
    const chord = CHORDS[Math.floor(bar / 2) % CHORDS.length];
    if (bar % 2 === 0) {
      this.pad(chord.pad, at, BAR * 2);
      this.bass(chord.bass, at, BAR * 2);
    }
    this.pulse(at);
    // the plucked line: a few eighth notes per bar, never the same pattern twice
    for (let step = 0; step < 8; step++) {
      const chance = step === 0 ? 0.15 : step % 2 === 0 ? 0.32 : 0.18;
      if (Math.random() < chance) {
        this.pluck(PLUCK_NOTES[Math.floor(Math.random() * PLUCK_NOTES.length)], at + step * (BEAT / 2));
      }
    }
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextBarAt < ctx.currentTime + 1.2) {
      this.scheduleBar(this.bar, this.nextBarAt);
      this.nextBarAt += BAR;
      this.bar++;
    }
  };

  /** Brighter pads further down the page */
  setDepth(progress: number) {
    if (!this.ctx || !this.padFilter) return;
    const p = Math.min(1, Math.max(0, progress));
    this.padFilter.frequency.setTargetAtTime(650 + p * 1500, this.ctx.currentTime, 0.6);
  }

  private startEngine() {
    const ctx = this.ctx!;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    void ctx.resume();
    const now = ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(VOLUME, now + 2.5);
    if (!this.timer) {
      this.nextBarAt = now + 0.1;
      this.tick();
      this.timer = setInterval(this.tick, 250);
    }
  }

  private stopEngine() {
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setValueAtTime(this.master!.gain.value, now);
    this.master!.gain.linearRampToValueAtTime(0, now + 1.2);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (this.suspendTimer) clearTimeout(this.suspendTimer);
    this.suspendTimer = setTimeout(() => void ctx.suspend(), 1400);
  }

  play() {
    if (this.playing) return;
    if (!this.ctx && !this.build()) return;
    this.playing = true;
    this.startEngine();
    this.remember(true);
    this.emit();
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    this.stopEngine();
    this.remember(false);
    this.emit();
  }

  toggle() {
    if (this.playing) this.pause();
    else this.play();
  }

  /** Quietly stop while the tab is in the background, and come back when it returns */
  setBackground(hidden: boolean) {
    if (!this.playing || !this.ctx) return;
    if (hidden) this.stopEngine();
    else this.startEngine();
  }
}

export const soundtrack = new Soundtrack();
