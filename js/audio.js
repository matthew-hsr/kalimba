// Audio: one shared AudioContext, a simple kalimba-like synth and the mic.

let ctx = null;
let master = null;

// iOS: "playback" makes sound play even with the silent switch on;
// "play-and-record" is required while the mic is open.
function setSession(type) {
  try {
    if (navigator.audioSession) navigator.audioSession.type = type;
  } catch {}
}

export function audioCtx() {
  if (!ctx) {
    setSession('playback');
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state !== 'running') ctx.resume();
  return ctx;
}

// A gain node feeding the master output, so a group of scheduled notes
// (a song playback) can be faded out and discarded together.
export function bus() {
  const c = audioCtx();
  const g = c.createGain();
  g.connect(master);
  return g;
}

// Schedule one pluck. Returns the time it fully decays.
export function pluck(freq, when = 0, { dest = null, vel = 0.45, length = 2.2 } = {}) {
  const c = audioCtx();
  const out = dest || master;
  const t = Math.max(when, c.currentTime);

  const body = c.createGain();
  body.gain.setValueAtTime(0, t);
  body.gain.linearRampToValueAtTime(vel, t + 0.004);
  body.gain.exponentialRampToValueAtTime(0.0005, t + length);
  body.connect(out);
  const fund = c.createOscillator();
  fund.frequency.value = freq;
  fund.connect(body);

  // Short metallic "ping" from the tine's inharmonic overtone.
  const ping = c.createGain();
  ping.gain.setValueAtTime(vel * 0.18, t);
  ping.gain.exponentialRampToValueAtTime(0.0005, t + 0.18);
  ping.connect(out);
  const over = c.createOscillator();
  over.frequency.value = Math.min(freq * 5.4, 12000);
  over.connect(ping);

  for (const o of [fund, over]) {
    o.start(t);
    o.stop(t + length + 0.05);
  }
  return t + length;
}

// Microphone with all voice processing turned off (it ruins pitch readings).
let micStream = null;
let analyser = null;

export async function startMic() {
  setSession('play-and-record');
  const c = audioCtx();
  micStream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const src = c.createMediaStreamSource(micStream);
  analyser = c.createAnalyser();
  analyser.fftSize = 4096;
  analyser.smoothingTimeConstant = 0;
  src.connect(analyser);
  return { analyser, sampleRate: c.sampleRate };
}

export function stopMic() {
  if (micStream) micStream.getTracks().forEach((t) => t.stop());
  micStream = null;
  analyser = null;
  setSession('playback');
}

export const micActive = () => !!micStream;
