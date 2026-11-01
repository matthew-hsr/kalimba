// Pitch detection for kalimba tines.
//
// A plucked tine has a strong fundamental plus a loud *inharmonic* overtone
// (~5-6x the fundamental) at the attack. That overtone pulls plain YIN off by
// tens of cents, so we detect twice: a rough YIN pass, then band-pass the
// signal around that estimate to strip the overtone and run YIN again.

// YIN (de Cheveigné & Kawahara, 2002) over buf[start..], searching periods
// tauMin..tauMax. Returns { period, aperiodicity } or null.
function yin(buf, start, tauMin, tauMax, threshold) {
  const w = Math.min((buf.length - start) >> 1, buf.length - start - tauMax - 2);
  if (w < 64) return null;
  const d = new Float32Array(tauMax + 2);
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    let sum = 0;
    for (let i = start; i < start + w; i++) {
      const diff = buf[i] - buf[i + tau];
      sum += diff * diff;
    }
    d[tau] = sum;
  }
  // Cumulative mean normalized difference.
  let running = 0;
  for (let tau = 1; tau <= tauMax + 1; tau++) {
    running += d[tau];
    d[tau] = running > 0 ? (d[tau] * tau) / running : 1;
  }
  // First dip below threshold, walked down to its local minimum.
  let tau = -1;
  for (let t = Math.max(2, tauMin); t <= tauMax; t++) {
    if (d[t] < threshold) {
      while (t + 1 <= tauMax && d[t + 1] < d[t]) t++;
      tau = t;
      break;
    }
  }
  if (tau < 0) return null;
  // Parabolic interpolation for sub-sample accuracy.
  const a = d[tau - 1], b = d[tau], c = d[tau + 1];
  const denom = a - 2 * b + c;
  const shift = denom !== 0 ? (0.5 * (a - c)) / denom : 0;
  return { period: tau + Math.max(-1, Math.min(1, shift)), aperiodicity: b };
}

// Two cascaded RBJ band-pass biquads centred on freq.
function bandpass(buf, sampleRate, freq, q = 2) {
  const w0 = (2 * Math.PI * freq) / sampleRate;
  const alpha = Math.sin(w0) / (2 * q);
  const a0 = 1 + alpha;
  const b0 = alpha / a0, b2 = -alpha / a0;
  const a1 = (-2 * Math.cos(w0)) / a0, a2 = (1 - alpha) / a0;
  let x = buf;
  for (let pass = 0; pass < 2; pass++) {
    const y = new Float32Array(x.length);
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < x.length; i++) {
      const v = b0 * x[i] + b2 * x2 - a1 * y1 - a2 * y2;
      x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
      y[i] = v;
    }
    x = y;
  }
  return x;
}

export function detectPitch(buf, sampleRate, { minFreq = 120, maxFreq = 1700, threshold = 0.15 } = {}) {
  let sq = 0, mean = 0;
  for (let i = 0; i < buf.length; i++) mean += buf[i];
  mean /= buf.length;
  for (let i = 0; i < buf.length; i++) sq += (buf[i] - mean) ** 2;
  const rms = Math.sqrt(sq / buf.length);
  if (rms < 1e-4) return null;

  const rough = yin(buf, 0, Math.floor(sampleRate / maxFreq), Math.ceil(sampleRate / minFreq), threshold);
  if (!rough) return null;

  // Refine: filter around the rough pitch, skip the filter's start-up, and
  // search only near the rough period.
  const f0 = sampleRate / rough.period;
  const filtered = bandpass(buf, sampleRate, f0);
  const skip = Math.min(buf.length >> 2, Math.ceil(6 * rough.period));
  const fine = yin(filtered, skip, Math.floor(rough.period * 0.9), Math.ceil(rough.period * 1.1), 0.2);

  return {
    freq: sampleRate / (fine ? fine.period : rough.period),
    clarity: 1 - rough.aperiodicity,
    rms,
  };
}
