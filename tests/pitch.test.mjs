// Synthesizes kalimba-like plucks (fundamental + inharmonic overtone + noise)
// at every tine, detuned by a few cents, and checks the detector's accuracy.
import { detectPitch } from '../js/pitch.js';
import { kalimbaTines } from '../js/music.js';

const SR = 48000, N = 4096;
let worst = 0, failures = 0;
for (const model of [17, 21]) {
  for (const t of kalimbaTines(model).tines) {
    for (const cents of [-37, -8, 0, 3, 22]) {
      const f = t.freq * Math.pow(2, cents / 1200);
      for (const offset of [0.02, 0.4]) { // early (attack) and later (decaying) windows
        const buf = new Float32Array(N);
        for (let i = 0; i < N; i++) {
          const s = offset + i / SR;
          buf[i] = 0.3 * Math.exp(-s * 2) * Math.sin(2 * Math.PI * f * s)
                 + 0.2 * Math.exp(-s * 12) * Math.sin(2 * Math.PI * f * 5.4 * s)
                 + 0.02 * Math.exp(-s * 2) * Math.sin(2 * Math.PI * f * 2 * s)
                 + 0.015 * (Math.random() * 2 - 1);
        }
        const r = detectPitch(buf, SR);
        const err = r ? 1200 * Math.log2(r.freq / f) : Infinity;
        worst = Math.max(worst, Math.abs(err));
        if (!(Math.abs(err) < 1)) { failures++; console.log(`FAIL ${t.name} ${cents}c off=${offset}: err ${err.toFixed(2)}c`); }
      }
    }
  }
}
console.log(`pitch: worst error ${worst.toFixed(3)} cents, ${failures} failures`);
process.exit(failures ? 1 : 0);
