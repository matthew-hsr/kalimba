// Note math, kalimba layouts and the song notation parser.
//
// Notes are stored as a "degree": scale steps counted from the kalimba's root
// note in its home octave. In C, degree 0 = C4, 7 = C5, 14 = C6, -4 = F3.

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const NAMES = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

// Root pitch class and the octave its lowest root sits in.
export const KEYS = {
  C: { pc: 0, oct: 4 },
  D: { pc: 2, oct: 4 },
  E: { pc: 4, oct: 4 },
  F: { pc: 5, oct: 4 },
  G: { pc: 7, oct: 3 },
  A: { pc: 9, oct: 3 },
  B: { pc: 11, oct: 3 },
};

export const MODELS = {
  17: { count: 17, start: 0, label: '17 keys', note: 'Most common' },
  21: { count: 21, start: -4, label: '21 keys', note: '' },
  10: { count: 10, start: 0, label: '10 keys', note: '' },
  8: { count: 8, start: 0, label: '8 keys', note: '' },
};

const mod = (n, m) => ((n % m) + m) % m;

export function degreeToMidi(d, key = 'C') {
  const k = KEYS[key] || KEYS.C;
  const root = 12 * (k.oct + 1) + k.pc;
  return root + 12 * Math.floor(d / 7) + MAJOR[mod(d, 7)];
}

export const midiToFreq = (m, a4 = 440) => a4 * Math.pow(2, (m - 69) / 12);
export const freqToMidi = (f, a4 = 440) => 69 + 12 * Math.log2(f / a4);
export const midiName = (m) => NAMES[mod(Math.round(m), 12)] + (Math.floor(Math.round(m) / 12) - 1);
export const midiLetter = (m) => NAMES[mod(Math.round(m), 12)];

// Number (1-7) and octave dots (+ above, - below) as engraved on kalimba tines.
export const degreeLabel = (d) => ({ num: mod(d, 7) + 1, oct: Math.floor(d / 7) });

// The tines of a kalimba, lowest first, each with its physical position.
// Lowest note sits in the middle; notes alternate left, right, left...
export function kalimbaTines(modelId = 17, key = 'C') {
  const model = MODELS[modelId] || MODELS[17];
  const tines = [];
  for (let i = 0; i < model.count; i++) {
    const d = model.start + i;
    const midi = degreeToMidi(d, key);
    tines.push({ i, d, midi, freq: midiToFreq(midi), name: midiName(midi), ...degreeLabel(d) });
  }
  const left = tines.filter((t) => t.i % 2 === 1).reverse();
  const right = tines.filter((t) => t.i % 2 === 0 && t.i > 0);
  const order = [...left, tines[0], ...right];
  order.forEach((t, pos) => (t.pos = pos));
  return { tines, order };
}

// Song notation (jianpu-style kalimba tabs):
//   1-7    scale notes, 0 = rest
//   ' ,    octave up / down (repeatable)
//   _      half as long (eighth), __ quarter as long (sixteenth)
//   .      dotted (1.5x)
//   -      hold one more beat each
//   |      bar line,  /  or newline = new line on screen
const TOKEN = /^([0-7])([',]*)(_*)(\.?)(-*)$/;

export function parseSong(src, baseOct = 1) {
  const lines = [];
  const events = [];
  let line = [];
  let bar = [];
  let t = 0;
  const endBar = () => {
    if (bar.length) line.push(bar);
    bar = [];
  };
  const endLine = () => {
    endBar();
    if (line.length) lines.push(line);
    line = [];
  };
  for (const tok of src.replace(/\n/g, ' / ').split(/\s+/).filter(Boolean)) {
    if (tok === '|') { endBar(); continue; }
    if (tok === '/') { endLine(); continue; }
    const m = TOKEN.exec(tok);
    if (!m) throw new Error(`Bad token "${tok}"`);
    const [, digit, marks, unders, dot, dashes] = m;
    const oct = baseOct + (marks.match(/'/g) || []).length - (marks.match(/,/g) || []).length;
    const base = Math.pow(0.5, unders.length) * (dot ? 1.5 : 1);
    const ev = {
      i: events.length,
      rest: digit === '0',
      d: digit === '0' ? null : Number(digit) - 1 + 7 * oct,
      under: unders.length,
      dot: !!dot,
      holds: dashes.length,
      beats: base + dashes.length,
      t,
    };
    t += ev.beats;
    events.push(ev);
    bar.push(ev);
  }
  endLine();
  return { lines, events, totalBeats: t };
}

// Octave shift (in degrees) that makes every note fit on the kalimba.
export function fitShift(events, modelId = 17) {
  const model = MODELS[modelId] || MODELS[17];
  const notes = events.filter((e) => !e.rest).map((e) => e.d);
  const lo = Math.min(...notes);
  const hi = Math.max(...notes);
  for (const s of [0, -7, 7, -14, 14]) {
    if (lo + s >= model.start && hi + s <= model.start + model.count - 1) return { shift: s, fits: true };
  }
  return { shift: 0, fits: false };
}
