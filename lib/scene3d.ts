/**
 * The 3D background: a universe you fly through as you scroll.
 * - Thousands of stars at different depths (white, blue-white and amber, like real star
 *   temperatures) that twinkle and stream past as you scroll, brighter the faster you go.
 * - A spiral galaxy made of glowing particles that slowly turns and drifts across the sky
 *   over the length of the page, coming closer as you near the end.
 * - Banded planets built from points, lit from one side, one with a ring.
 * - Now and then a shooting star.
 *
 * Plain WebGL 1 (no 3D library), so it adds only a few KB and runs on old phones too: all
 * positions and twinkling are worked out on the graphics card. It pauses while the tab is
 * hidden, draws fewer particles on phones and fewer frames on older devices, adjusts its
 * resolution live to hold a smooth frame rate, and draws one still frame for reduced motion.
 * If WebGL isn't available, start() returns null and the page keeps its plain background.
 */

type Vec3 = [number, number, number];
type M4 = Float32Array;

const hex = (h: string): Vec3 => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const BASE = hex("#23282D"); // gunmetal, the page colour
const BONE = hex("#ECE7DC");
const AMBER = hex("#E3A43A");
const STEEL = hex("#8DB0CC");
const TEAL = hex("#74B8AC");
const SAND = hex("#D4C39B");
const OLIVE = hex("#A9B46A");
const mix = (a: Vec3, b: Vec3, k: number): Vec3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const scale = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];

const STAR_DEPTH = 130; // stars fill this much space ahead and wrap round as you fly
const PLANET_DEPTH = 96;
const LIGHT: Vec3 = (() => {
  const v: Vec3 = [-0.55, 0.45, 0.7];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

const randn = () => {
  let u = 0;
  while (!u) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
};

// ---------- shaders ----------
// every particle: position, colour, size and a random seed (for twinkle timing)
const POINT_VS = `
attribute vec3 aPos;
attribute vec3 aCol;
attribute float aSize;
attribute float aSeed;
uniform mat4 uPV, uM;
uniform float uT, uDpr, uOff, uWrap, uLit, uSizeK, uFar, uAlpha, uBoost;
uniform vec3 uLight;
varying vec3 vC;
varying float vA;
void main() {
  vec3 p = aPos;
  if (uWrap > 0.0) p.z = mod(p.z + uOff, uWrap) - uWrap + 8.0;
  vec4 clip = uPV * uM * vec4(p, 1.0);
  gl_Position = clip;
  float d = max(clip.w, 0.1);
  float tw = 0.68 + 0.32 * sin(uT * (0.7 + aSeed * 2.6) + aSeed * 60.0);
  float lit = 1.0;
  if (uLit > 0.5) lit = 0.06 + 0.94 * max(dot(normalize((uM * vec4(aPos, 0.0)).xyz), uLight), 0.0);
  gl_PointSize = uDpr * aSize * clamp(uSizeK / d, 0.55, 3.4) * (1.0 + uBoost * 0.5);
  vA = uAlpha * tw * lit * smoothstep(uFar, uFar * 0.55, d) * smoothstep(0.4, 3.0, d) * (1.0 + uBoost * 0.8);
  vC = aCol;
}`;
// a sharp disc with a clean anti-aliased edge and a faint halo, so particles stay crisp at
// full screen resolution; drawn additively so overlapping light adds up like real light
const POINT_FS = `
precision mediump float;
varying vec3 vC;
varying float vA;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c) * 2.0;
  if (r > 1.0) discard;
  float core = 1.0 - smoothstep(0.42, 0.72, r);
  float halo = (1.0 - r) * 0.22;
  float a = vA * (core + halo);
  gl_FragColor = vec4(vC * a, 1.0);
}`;

// shooting star: a line that is bright at its head and fades to nothing at its tail
const STREAK_VS = `
attribute vec3 aPos;
attribute float aK;
uniform mat4 uPV;
varying float vK;
void main() {
  gl_Position = uPV * vec4(aPos, 1.0);
  vK = aK;
}`;
const STREAK_FS = `
precision mediump float;
uniform float uA;
uniform vec3 uC;
varying float vK;
void main() {
  gl_FragColor = vec4(uC * vK * uA, 1.0);
}`;

// ---------- matrices (column-major, like WebGL expects) ----------
function perspective(fovY: number, aspect: number, near: number, far: number): M4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function lookAt(e: Vec3, c: Vec3): M4 {
  let zx = e[0] - c[0], zy = e[1] - c[1], zz = e[2] - c[2];
  let l = Math.hypot(zx, zy, zz);
  zx /= l; zy /= l; zz /= l;
  let xx = zz, xz = -zx;
  const xy = 0;
  l = Math.hypot(xx, xz);
  xx /= l; xz /= l;
  const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
  return new Float32Array([
    xx, yx, zx, 0,
    xy, yy, zy, 0,
    xz, yz, zz, 0,
    -(xx * e[0] + xy * e[1] + xz * e[2]), -(yx * e[0] + yy * e[1] + yz * e[2]), -(zx * e[0] + zy * e[1] + zz * e[2]), 1,
  ]);
}
function mul(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) o[j * 4 + i] = a[i] * b[j * 4] + a[4 + i] * b[j * 4 + 1] + a[8 + i] * b[j * 4 + 2] + a[12 + i] * b[j * 4 + 3];
  return o;
}
const translate = (x: number, y: number, z: number): M4 => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const rotX = (a: number): M4 => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const rotY = (a: number): M4 => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const rotZ = (a: number): M4 => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); };
const IDENTITY = translate(0, 0, 0);

// ---------- the objects ----------
type Planet = { x: number; y: number; z: number; r: number; color: Vec3; band: Vec3; ring?: Vec3; tilt: number; spin: number };
const PLANETS: Planet[] = [
  { x: -10, y: 3.8, z: -30, r: 3, color: AMBER, band: SAND, ring: SAND, tilt: 0.42, spin: 0.12 },
  { x: 11, y: -4.5, z: -55, r: 3.6, color: STEEL, band: BONE, tilt: -0.25, spin: -0.08 },
  { x: -7, y: -6, z: -82, r: 2, color: TEAL, band: OLIVE, tilt: 0.2, spin: 0.15 },
];

function compile(gl: WebGLRenderingContext, vs: string, fs: string) {
  const make = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) ?? "link");
  return p;
}

export type SceneHandle = { stop: () => void };

const lowEnd = () => {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
};

export function start(canvas: HTMLCanvasElement, onFirstFrame: () => void): SceneHandle | null {
  let gl: WebGLRenderingContext | null = null;
  try {
    // no multisampling: at full pixel density the edges are already fine, and it would cost a lot of memory on big screens
    gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power", preserveDrawingBuffer: false });
  } catch {
    gl = null;
  }
  if (!gl || gl.isContextLost()) return null;
  const g = gl;
  canvas.style.opacity = "";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = window.innerWidth < 768;
  const weak = lowEnd();

  let pointProg: WebGLProgram, streakProg: WebGLProgram;
  try {
    pointProg = compile(g, POINT_VS, POINT_FS);
    streakProg = compile(g, STREAK_VS, STREAK_FS);
  } catch {
    return null;
  }

  // ---------- particle clouds: interleaved [x y z, r g b, size, seed] ----------
  const cloud = (fill: (push: (p: Vec3, c: Vec3, size: number) => void) => void) => {
    const data: number[] = [];
    fill((p, c, size) => data.push(p[0], p[1], p[2], c[0], c[1], c[2], size, Math.random()));
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array(data), g.STATIC_DRAW);
    return { buf, count: data.length / 8 };
  };

  // stars: mostly small, a few bright; colours follow star temperatures
  const stars = cloud((push) => {
    const n = weak ? 2600 : small ? 4200 : 8000;
    for (let i = 0; i < n; i++) {
      const x = (Math.random() * 2 - 1) * 48;
      const y = (Math.random() * 2 - 1) * 30;
      const z = Math.random() * STAR_DEPTH;
      const k = Math.random();
      const c = k < 0.72 ? BONE : k < 0.88 ? mix(STEEL, BONE, 0.35) : k < 0.97 ? mix(AMBER, BONE, 0.3) : AMBER;
      const size = 0.9 + Math.pow(Math.random(), 6) * 3.2;
      push([x, y, z], c, size);
    }
  });

  // spiral galaxy: a warm core and two arms that cool from bone to steel to teal outwards
  const galaxy = cloud((push) => {
    const n = weak ? 5000 : small ? 9000 : 18000;
    const R = 17;
    for (let i = 0; i < n; i++) {
      if (i < n * 0.16) {
        const r = Math.abs(randn()) * 1.9;
        const a = Math.random() * Math.PI * 2;
        push([Math.cos(a) * r, randn() * 0.55 * (1 - r / 6), Math.sin(a) * r], scale(mix(AMBER, BONE, Math.min(1, r / 2.2)), 0.55), 1.1 + Math.random() * 1.2);
        continue;
      }
      const arm = i % 2;
      const t = Math.pow(Math.random(), 0.75);
      const r = 1.2 + t * R;
      const spread = 0.42 * (0.4 + t);
      const a = r * 0.42 + arm * Math.PI + randn() * spread;
      const x = Math.cos(a) * r + randn() * 0.35;
      const z = Math.sin(a) * r + randn() * 0.35;
      const y = randn() * 0.3 * (1 - t * 0.6);
      const c = t < 0.45 ? mix(BONE, STEEL, t / 0.45) : mix(STEEL, TEAL, (t - 0.45) / 0.55);
      push([x, y, z], scale(c, 0.65 + Math.random() * 0.35), 0.7 + Math.random() * 1.1);
    }
  });

  // planets: points spread evenly over a sphere, with soft bands; one has a ring
  const planets = PLANETS.map((pl) => {
    const body = cloud((push) => {
      const n = weak ? 1300 : small ? 2400 : 4200;
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;
        const rr = Math.sqrt(1 - y * y);
        const a = golden * i;
        const band = 0.5 + 0.5 * Math.sin(y * 9 + Math.sin(a * 0.5) * 0.6);
        push([Math.cos(a) * rr * pl.r, y * pl.r, Math.sin(a) * rr * pl.r], mix(pl.color, pl.band, band * 0.55), 1.4);
      }
    });
    const ring = pl.ring
      ? cloud((push) => {
          const n = weak ? 700 : small ? 1400 : 2600;
          for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const r = pl.r * (1.45 + Math.pow(Math.random(), 0.8) * 0.85);
            push([Math.cos(a) * r, randn() * 0.02, Math.sin(a) * r], scale(pl.ring!, 0.6 + Math.random() * 0.4), 1.1);
          }
        })
      : null;
    return { pl, body, ring };
  });

  const streakBuf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, streakBuf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array(8), g.DYNAMIC_DRAW);

  // ---------- attribute and uniform lookups ----------
  const U = (p: WebGLProgram, n: string) => g.getUniformLocation(p, n);
  const pu = {
    pv: U(pointProg, "uPV"), m: U(pointProg, "uM"), t: U(pointProg, "uT"), dpr: U(pointProg, "uDpr"), off: U(pointProg, "uOff"),
    wrap: U(pointProg, "uWrap"), lit: U(pointProg, "uLit"), sizeK: U(pointProg, "uSizeK"), far: U(pointProg, "uFar"),
    alpha: U(pointProg, "uAlpha"), boost: U(pointProg, "uBoost"), light: U(pointProg, "uLight"),
  };
  const pa = { pos: g.getAttribLocation(pointProg, "aPos"), col: g.getAttribLocation(pointProg, "aCol"), size: g.getAttribLocation(pointProg, "aSize"), seed: g.getAttribLocation(pointProg, "aSeed") };
  const su = { pv: U(streakProg, "uPV"), a: U(streakProg, "uA"), c: U(streakProg, "uC") };
  const sa = { pos: g.getAttribLocation(streakProg, "aPos"), k: g.getAttribLocation(streakProg, "aK") };

  const drawCloud = (c: { buf: WebGLBuffer | null; count: number }, m: M4, o: { wrap?: number; off?: number; lit?: boolean; sizeK: number; far: number; alpha: number; boost?: number }) => {
    g.uniformMatrix4fv(pu.m, false, m);
    g.uniform1f(pu.wrap, o.wrap ?? 0);
    g.uniform1f(pu.off, o.off ?? 0);
    g.uniform1f(pu.lit, o.lit ? 1 : 0);
    g.uniform1f(pu.sizeK, o.sizeK);
    g.uniform1f(pu.far, o.far);
    g.uniform1f(pu.alpha, o.alpha);
    g.uniform1f(pu.boost, o.boost ?? 0);
    g.bindBuffer(g.ARRAY_BUFFER, c.buf);
    g.vertexAttribPointer(pa.pos, 3, g.FLOAT, false, 32, 0);
    g.vertexAttribPointer(pa.col, 3, g.FLOAT, false, 32, 12);
    g.vertexAttribPointer(pa.size, 1, g.FLOAT, false, 32, 24);
    g.vertexAttribPointer(pa.seed, 1, g.FLOAT, false, 32, 28);
    g.drawArrays(g.POINTS, 0, c.count);
  };

  g.enable(g.BLEND);
  g.clearColor(BASE[0], BASE[1], BASE[2], 1);

  // ---------- sizing ----------
  // Draw at the screen's own pixel density (up to 2x, the point where extra pixels stop being
  // visible), so stars are as sharp as the text. If frames start taking too long, the
  // resolution steps down a little at a time, and steps back up once there is room again.
  // never more than about 4K worth of pixels (3840 x 2160), even on 5K and 6K displays
  const maxDpr = Math.min(window.devicePixelRatio || 1, weak ? 1.5 : 2, Math.sqrt(8.3e6 / Math.max(1, window.innerWidth * window.innerHeight)));
  const minDpr = Math.max(0.75, maxDpr * 0.5);
  let dpr = maxDpr;
  let w = 0, h = 0;
  const resize = () => {
    const pw = Math.max(1, Math.round(canvas.clientWidth * dpr)), ph = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (pw === w && ph === h) return false;
    w = pw; h = ph;
    canvas.width = w;
    canvas.height = h;
    g.viewport(0, 0, w, h);
    return true;
  };

  // ---------- input: scrolling flies forward, the mouse leans the view ----------
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  // the last time the visitor scrolled or moved the mouse (the scene runs at full speed then)
  let lastInput = performance.now();
  const onScroll = () => {
    lastInput = performance.now();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    lastInput = performance.now();
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (!reduce) window.addEventListener("pointermove", onMove, { passive: true });

  let flight = window.scrollY;
  let boost = 0;
  let maxScroll = 1;
  let measured = -Infinity;
  const t0 = performance.now();

  // shooting stars: one every few seconds, somewhere in the upper sky
  const streak = { born: -10, life: 1.1, from: [0, 0, 0] as Vec3, dir: [0, 0, 0] as Vec3, next: 2.5 };
  const spawn = (t: number) => {
    const side = Math.random() < 0.5 ? -1 : 1;
    streak.from = [side * (6 + Math.random() * 18), 6 + Math.random() * 10, -30 - Math.random() * 25];
    const d: Vec3 = [-side * (0.8 + Math.random() * 0.4), -(0.35 + Math.random() * 0.3), 0.1];
    const l = Math.hypot(...d);
    streak.dir = [d[0] / l, d[1] / l, d[2] / l];
    streak.born = t;
    streak.next = t + 3.5 + Math.random() * 5;
  };

  const ease = (k: number, dt: number) => 1 - Math.pow(1 - k, dt / 16.67);
  const draw = (now: number, dt = 16.67) => {
    const t = reduce ? 0 : (now - t0) / 1000;
    const y = window.scrollY;
    // ease the scroll and pointer so the camera glides instead of jumping; the easing is tied to
    // time, not frames, so it feels the same on 60 Hz and 120 Hz screens
    const step = (y - flight) * (reduce ? 1 : ease(0.08, dt));
    flight += step;
    boost += (Math.min((Math.abs(step) / Math.max(dt, 1)) * 0.33, 1) - boost) * ease(0.1, dt); // faster scrolling, brighter streaming stars
    pointer.sx += (pointer.x - pointer.sx) * ease(0.05, dt);
    pointer.sy += (pointer.y - pointer.sy) * ease(0.05, dt);
    // page length is measured about once a second, not every frame, so drawing never forces a layout
    if (now - measured > 1000) {
      measured = now;
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }
    const progress = Math.min(1, Math.max(0, flight / maxScroll));
    const off = flight * 0.02 + t * 0.6; // forward travel through the stars

    const aspect = w / h;
    const proj = perspective((aspect < 0.8 ? 66 : 55) * (Math.PI / 180), aspect, 0.1, 200);
    const sway = Math.sin(t * 0.06) * 0.8;
    const eye: Vec3 = [pointer.sx * 1.4 + sway, -pointer.sy * 0.9 + Math.sin(t * 0.05) * 0.4, 6];
    const pv = mul(proj, lookAt(eye, [pointer.sx * 0.5 + sway * 0.4, 0, -20]));

    g.clear(g.COLOR_BUFFER_BIT);

    // --- glowing particles (added together, like light) ---
    g.blendFunc(g.ONE, g.ONE);
    g.useProgram(pointProg);
    g.uniformMatrix4fv(pu.pv, false, pv);
    g.uniform1f(pu.t, t);
    g.uniform1f(pu.dpr, dpr);
    g.uniform3fv(pu.light, LIGHT);
    for (const a of [pa.pos, pa.col, pa.size, pa.seed]) g.enableVertexAttribArray(a);

    // the galaxy keeps to the right-hand edge (partly off screen, away from most text), sinking
    // from the top towards the bottom and coming a little closer as you read down
    const wide = aspect > 1;
    const gx = wide ? 40 - progress * 4 : 14;
    const gy = (wide ? 14 : 20) - progress * (wide ? 26 : 34);
    const gz = -78 + progress * 14;
    const gm = mul(translate(gx, gy, gz), mul(rotZ(-0.35), mul(rotX(1.12), rotY(t * 0.02 + progress * 1.4))));
    drawCloud(galaxy, gm, { sizeK: 95, far: 220, alpha: small ? 0.5 : 0.66 });

    drawCloud(stars, IDENTITY, { wrap: STAR_DEPTH, off, sizeK: 26, far: 120, alpha: 0.85, boost });

    const placed = planets.map((p, i) => {
      const pl = p.pl;
      const z = ((((pl.z + PLANET_DEPTH - 8 + off * 0.45) % PLANET_DEPTH) + PLANET_DEPTH) % PLANET_DEPTH) - (PLANET_DEPTH - 8);
      const bob = Math.sin(t * 0.4 + i * 2) * 0.25;
      const base = translate(pl.x, pl.y + bob, z);
      const body = mul(base, mul(rotX(pl.tilt), rotY(t * pl.spin)));
      return { p, base, body, z };
    });
    for (const q of placed) {
      drawCloud(q.p.body, q.body, { lit: true, sizeK: 44, far: 110, alpha: 1.25 });
      if (q.p.ring) drawCloud(q.p.ring, mul(q.base, rotX(q.p.pl.tilt)), { sizeK: 38, far: 110, alpha: 1.05 });
    }
    for (const a of [pa.pos, pa.col, pa.size, pa.seed]) g.disableVertexAttribArray(a);

    // --- shooting star ---
    if (!reduce) {
      if (t > streak.next) spawn(t);
      const age = (t - streak.born) / streak.life;
      if (age >= 0 && age <= 1) {
        const travel = age * 26;
        const len = 7 * Math.sin(Math.PI * Math.min(age * 1.4, 1));
        const head: Vec3 = [streak.from[0] + streak.dir[0] * travel, streak.from[1] + streak.dir[1] * travel, streak.from[2] + streak.dir[2] * travel];
        const tail: Vec3 = [head[0] - streak.dir[0] * len, head[1] - streak.dir[1] * len, head[2] - streak.dir[2] * len];
        g.useProgram(streakProg);
        g.uniformMatrix4fv(su.pv, false, pv);
        g.uniform1f(su.a, 0.9 * Math.sin(Math.PI * age));
        g.uniform3fv(su.c, BONE);
        g.bindBuffer(g.ARRAY_BUFFER, streakBuf);
        g.bufferSubData(g.ARRAY_BUFFER, 0, new Float32Array([...tail, 0, ...head, 1]));
        g.enableVertexAttribArray(sa.pos);
        g.enableVertexAttribArray(sa.k);
        g.vertexAttribPointer(sa.pos, 3, g.FLOAT, false, 16, 0);
        g.vertexAttribPointer(sa.k, 1, g.FLOAT, false, 16, 12);
        g.drawArrays(g.LINES, 0, 2);
        g.disableVertexAttribArray(sa.pos);
        g.disableVertexAttribArray(sa.k);
      }
    }
  };

  // ---------- loop: pauses when hidden, lowers resolution if the device struggles ----------
  let raf = 0;
  let first = true;
  let last = 0;
  let lost = false;
  // frame-time samples, judged once a second
  let sum = 0;
  let count = 0;
  let windowStart = 0;
  let good = 0;
  let settled = 0;
  // Frame pacing, to keep the whole page light:
  // - while you scroll or move the mouse, up to 60 frames a second (also on 90/120 Hz screens,
  //   where more frames would only cost power: the motion is slow);
  // - while you're just reading, ~30 frames a second: the slow drift and twinkle look the same,
  //   and it halves the work for the graphics card, including re-blurring the glass panels
  //   that sit over the moving background;
  // - older, low-memory devices always run at ~30.
  const gapFor = (now: number) => (weak ? 30 : now - lastInput < 700 || Math.abs(window.scrollY - flight) > 0.5 ? 15 : 30);

  const markFirst = () => {
    if (!first) return;
    first = false;
    onFirstFrame();
  };

  const frame = (now: number) => {
    raf = requestAnimationFrame(frame);
    const gap = gapFor(now);
    if (last && now - last < gap) return;
    const dt = last ? now - last : 16.67;
    last = now;
    // Ignore the first 2 s (the page is still loading) and long gaps (the browser paused us,
    // e.g. a background tab), then judge the average frame time once a second.
    if (settled++ > 120 && dt < 250) {
      sum += Math.max(0, dt - Math.max(gap, 16.67)); // how late each frame came, compared with the plan
      count++;
      if (!windowStart) windowStart = now;
      if (now - windowStart > 1000 && count > 10) {
        const late = sum / count;
        if (late > 9 && dpr > minDpr) {
          dpr = Math.max(minDpr, dpr * 0.85);
          w = 0;
          good = 0;
        } else if (late < 4 && dpr < maxDpr && ++good >= 4) {
          dpr = Math.min(maxDpr, dpr * 1.1);
          w = 0;
          good = 0;
        }
        sum = 0;
        count = 0;
        windowStart = now;
      }
    }
    resize();
    draw(now, Math.min(dt, 100));
    markFirst();
  };

  const run = () => {
    if (lost || raf || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(frame);
  };
  const pause = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };
  const onVisibility = () => (document.hidden ? pause() : run());
  const onResize = () => {
    if (reduce && resize()) draw(performance.now());
  };
  const onLost = (e: Event) => {
    e.preventDefault();
    lost = true;
    pause();
    canvas.style.opacity = "0";
  };

  canvas.addEventListener("webglcontextlost", onLost);
  window.addEventListener("resize", onResize);
  if (reduce) {
    resize();
    draw(performance.now());
    markFirst();
  } else {
    document.addEventListener("visibilitychange", onVisibility);
    run();
  }

  return {
    stop() {
      pause();
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
