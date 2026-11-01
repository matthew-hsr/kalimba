import { MODELS, KEYS, kalimbaTines, parseSong, fitShift, degreeToMidi, midiToFreq, freqToMidi, midiName, midiLetter, degreeLabel } from './music.js';
import { detectPitch } from './pitch.js';
import { audioCtx, pluck, bus, startMic, stopMic } from './audio.js';
import { SONGS, CATEGORIES } from './songs.js';

// ---------- Settings ----------

const DEFAULTS = { model: 17, key: 'C', labels: 'both', size: 1, speed: 1, tab: 'tuner' };
const settings = { ...DEFAULTS };
try {
  Object.assign(settings, JSON.parse(localStorage.getItem('kalimba-settings') || '{}'));
} catch {}
if (!MODELS[settings.model]) settings.model = DEFAULTS.model;
if (!KEYS[settings.key]) settings.key = DEFAULTS.key;

function save() {
  try {
    localStorage.setItem('kalimba-settings', JSON.stringify(settings));
  } catch {}
}

// ---------- Helpers ----------

const view = document.getElementById('view');
const $ = (sel, root = view) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const freqOf = (d) => midiToFreq(degreeToMidi(d, settings.key));
const letterOf = (d) => midiLetter(degreeToMidi(d, settings.key));
// True inside the iOS / Android app (Capacitor), false in a browser.
const native = !!window.Capacitor?.isNativePlatform?.();

// A note as printed on the tine: number (or letter) with octave dots.
function noteGlyph(d, extraClass = '') {
  const { num, oct } = degreeLabel(d);
  const up = oct > 0 ? '•'.repeat(oct) : '';
  const dn = oct < 0 ? '•'.repeat(-oct) : '';
  const main = settings.labels === 'letters' ? letterOf(d) : num;
  const sub = settings.labels === 'both' ? `<small class="lt">${letterOf(d)}</small>` : '';
  return `<span class="glyph ${extraClass}"><span class="dots">${up}</span><span class="dg">${main}</span><span class="dots">${dn}</span></span>${sub}`;
}

// Keep the screen awake while tuning or reading music.
let wakeLock = null;
let wantAwake = false;
async function keepAwake(on) {
  wantAwake = on;
  try {
    if (native) await window.Capacitor.nativePromise('KeepAwake', on ? 'keepAwake' : 'allowSleep', {});
    else if (on && !wakeLock && navigator.wakeLock && document.visibilityState === 'visible') {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => (wakeLock = null));
    } else if (!on && wakeLock) {
      await wakeLock.release();
      wakeLock = null;
    }
  } catch {}
}

// ---------- Kalimba picture ----------

function kalimbaPicture(container, { onTap } = {}) {
  const { tines, order } = kalimbaTines(settings.model, settings.key);
  const n = tines.length;
  container.classList.add('kalimba');
  container.style.setProperty('--n', n);
  container.innerHTML = order
    .map((t) => {
      const len = 1 - (t.i / Math.max(1, n - 1)) * 0.5;
      return `<button class="tine" data-d="${t.d}" style="--len:${len.toFixed(3)}" aria-label="${t.name}">
        <span class="tine-label">${noteGlyph(t.d)}</span><span class="mark"></span></button>`;
    })
    .join('');
  const byD = new Map([...container.querySelectorAll('.tine')].map((b) => [Number(b.dataset.d), b]));
  container.addEventListener('click', (e) => {
    const b = e.target.closest('.tine');
    if (b && onTap) onTap(tines.find((t) => t.d === Number(b.dataset.d)), b);
  });
  return {
    tines,
    el: (d) => byD.get(d),
    flash(d, ms = 350) {
      const b = byD.get(d);
      if (!b) return;
      b.classList.add('on');
      clearTimeout(b._t);
      b._t = setTimeout(() => b.classList.remove('on'), ms);
    },
    only(d) {
      for (const [k, b] of byD) b.classList.toggle('on', k === d);
    },
  };
}

// ---------- Tuner ----------

const tunedThisSession = new Map(); // degree -> 'ok' | 'low' | 'high'

function tunerView() {
  view.innerHTML = `
    <section class="page tuner">
      <div class="readout" id="readout" data-state="off">
        <div class="r-off">
          <button class="big-btn" id="start">Start tuner</button>
          <p class="muted">Your ${native ? 'phone' : 'browser'} will ask to use the microphone.<br>Nothing is recorded or sent anywhere.</p>
        </div>
        <div class="r-on">
          <div class="r-note" id="r-note">–</div>
          <div class="r-name" id="r-name">Pluck one tine</div>
          <div class="meter" aria-hidden="true">
            <div class="meter-zone"></div>
            <div class="meter-mid"></div>
            <div class="meter-needle" id="needle"></div>
            <span class="meter-l">low</span><span class="meter-r">high</span>
          </div>
          <div class="r-advice" id="r-advice">&nbsp;</div>
          <div class="r-tip" id="r-tip">&nbsp;</div>
        </div>
      </div>
      <div id="kal"></div>
      <div class="tuner-foot">
        <p class="muted">Tap a tine in the picture to hear how it should sound.
        Green ticks show tines that have been checked and are in tune.</p>
        <div class="row">
          <button class="btn" id="clear">Clear ticks</button>
          <button class="btn" id="stop" hidden>Stop tuner</button>
        </div>
      </div>
    </section>`;

  const readout = $('#readout');
  let suppressUntil = 0;
  const kal = kalimbaPicture($('#kal'), {
    onTap(t) {
      // Don't let the reference tone count as a reading.
      suppressUntil = performance.now() + 2200;
      pluck(t.freq);
      kal.flash(t.d, 600);
    },
  });
  const paintMarks = () => {
    for (const t of kal.tines) {
      const b = kal.el(t.d);
      b.dataset.status = tunedThisSession.get(t.d) || '';
    }
  };
  paintMarks();
  $('#clear').onclick = () => {
    tunedThisSession.clear();
    paintMarks();
  };

  const tines = kal.tines;
  const minFreq = tines[0].freq * 0.75;
  const maxFreq = tines[tines.length - 1].freq * 1.3;
  let raf = 0;
  let running = false;

  async function start() {
    try {
      const { analyser, sampleRate } = await startMic();
      running = true;
      readout.dataset.state = 'on';
      $('#stop').hidden = false;
      keepAwake(true);
      listen(analyser, sampleRate);
    } catch (err) {
      readout.dataset.state = 'off';
      $('.r-off .muted').innerHTML =
        `<b>Couldn't use the microphone.</b><br>Allow microphone access for this site in your browser settings, then try again.`;
    }
  }

  function stop() {
    running = false;
    cancelAnimationFrame(raf);
    stopMic();
    keepAwake(false);
    readout.dataset.state = 'off';
    $('#stop').hidden = true;
    kal.only(null);
  }

  function listen(analyser, sampleRate) {
    const buf = new Float32Array(analyser.fftSize);
    let noise = 0.002;
    let lastHeard = 0;
    let currentD = null;
    let history = [];
    let steady = 0;

    const show = (state) => (readout.dataset.reading = state);

    const frame = () => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      analyser.getFloatTimeDomainData(buf);
      if (now < suppressUntil) return;

      const r = detectPitch(buf, sampleRate, { minFreq, maxFreq });
      const loud = r && r.rms > Math.max(0.003, noise * 3);
      if (!r || !loud || r.clarity < 0.8) {
        // Track the background level while nothing is ringing.
        let sq = 0;
        for (let i = 0; i < buf.length; i += 4) sq += buf[i] * buf[i];
        noise = noise * 0.97 + Math.sqrt(sq / (buf.length / 4)) * 0.03;
        if (now - lastHeard > 1800 && currentD !== null) {
          currentD = null;
          history = [];
          kal.only(null);
          show('idle');
          $('#r-note').innerHTML = '–';
          $('#r-name').textContent = 'Pluck one tine';
          $('#r-advice').innerHTML = '&nbsp;';
          $('#r-tip').innerHTML = '&nbsp;';
        }
        return;
      }
      lastHeard = now;

      // Nearest tine on this kalimba.
      let best = null;
      for (const t of tines) {
        const c = 1200 * Math.log2(r.freq / t.freq);
        if (!best || Math.abs(c) < Math.abs(best.c)) best = { t, c };
      }
      if (Math.abs(best.c) > 100) {
        show('far');
        $('#r-note').textContent = midiName(freqToMidi(r.freq));
        $('#r-name').textContent = `${r.freq.toFixed(1)} Hz – not a note on your kalimba`;
        $('#r-advice').innerHTML = '&nbsp;';
        return;
      }

      if (best.t.d !== currentD) {
        currentD = best.t.d;
        history = [];
        steady = 0;
        kal.only(currentD);
        $('#r-note').innerHTML = noteGlyph(currentD);
        $('#r-name').textContent = best.t.name;
      }
      history.push(best.c);
      if (history.length > 7) history.shift();
      const sorted = [...history].sort((a, b) => a - b);
      const cents = sorted[sorted.length >> 1];

      const pos = Math.max(-50, Math.min(50, cents));
      $('#needle').style.left = `${50 + pos}%`;
      const rounded = Math.round(cents);
      const label = `${rounded > 0 ? '+' : ''}${rounded} cents`;
      $('#r-name').textContent = `${best.t.name} · ${label}`;

      let status;
      if (Math.abs(cents) <= 5) {
        status = 'ok';
        $('#r-advice').textContent = '✓ In tune';
        $('#r-tip').innerHTML = '&nbsp;';
      } else if (cents < 0) {
        status = 'low';
        $('#r-advice').textContent = '↑ Too low';
        $('#r-tip').textContent = 'Tap the tip of the tine (the end you pluck) toward the bridge. Shorter = higher.';
      } else {
        status = 'high';
        $('#r-advice').textContent = '↓ Too high';
        $('#r-tip').textContent = 'Tap the back end of the tine (behind the bridge) so the playing part gets longer. Longer = lower.';
      }
      show(status);

      // Only mark a tine after a few steady readings.
      steady = history.length >= 4 ? steady + 1 : 0;
      if (steady >= 4) {
        const prev = tunedThisSession.get(currentD);
        if (prev !== status) {
          tunedThisSession.set(currentD, status);
          kal.el(currentD).dataset.status = status;
        }
      }
    };
    frame();
  }

  $('#start').onclick = start;
  $('#stop').onclick = stop;
  return () => {
    if (running) stop();
    keepAwake(false);
  };
}

// ---------- Song list ----------

let listFilter = { q: '', cat: 'All' };

function songsView() {
  view.innerHTML = `
    <section class="page songs">
      <h1>Songs</h1>
      <input type="search" id="q" placeholder="Search ${SONGS.length} songs" value="${esc(listFilter.q)}" autocomplete="off">
      <div class="chips" id="chips">
        ${['All', ...CATEGORIES].map((c) => `<button class="chip" data-cat="${c}" aria-pressed="${c === listFilter.cat}">${c}</button>`).join('')}
      </div>
      <div id="list"></div>
    </section>`;

  const render = () => {
    const q = listFilter.q.trim().toLowerCase();
    const groups = CATEGORIES.filter((c) => listFilter.cat === 'All' || c === listFilter.cat)
      .map((cat) => ({ cat, songs: SONGS.filter((s) => s.cat === cat && (!q || s.title.toLowerCase().includes(q))) }))
      .filter((g) => g.songs.length);
    $('#list').innerHTML = groups.length
      ? groups
          .map(
            (g) => `<h2>${g.cat}</h2><ul class="song-list">${g.songs
              .map((s) => `<li><a href="#/song/${s.id}"><span>${esc(s.title)}</span><svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></a></li>`)
              .join('')}</ul>`,
          )
          .join('')
      : `<p class="muted empty">No songs match “${esc(listFilter.q)}”.</p>`;
  };
  render();

  $('#q').addEventListener('input', (e) => {
    listFilter.q = e.target.value;
    render();
  });
  $('#chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    listFilter.cat = b.dataset.cat;
    view.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', c === b));
    render();
  });
}

// ---------- Song page ----------

function songView(id) {
  const song = SONGS.find((s) => s.id === id);
  if (!song) {
    location.hash = '#/songs';
    return;
  }
  const parsed = parseSong(song.notes, song.o ?? 1);
  const { shift, fits } = fitShift(parsed.events, settings.model);
  const model = MODELS[settings.model];
  const inRange = (d) => d >= model.start && d < model.start + model.count;

  const evHtml = (ev) => {
    if (ev.rest) return `<span class="ev rest" data-i="${ev.i}"><span class="glyph u${ev.under}"><span class="dots"></span><span class="dg">0</span><span class="dots"></span></span></span>`;
    const d = ev.d + shift;
    const cls = inRange(d) ? '' : ' missing';
    return `<span class="ev${cls}" data-i="${ev.i}"><span class="nt">${noteGlyph(d, 'u' + ev.under)}</span>${ev.dot ? '<span class="aug">·</span>' : ''}${'<span class="hold">–</span>'.repeat(ev.holds)}</span>`;
  };

  view.innerHTML = `
    <section class="page song">
      <div class="song-head">
        <a class="back" href="#/songs"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>Songs</a>
        <h1>${esc(song.title)}</h1>
      </div>
      <div class="song-top">
        <div class="kal-mini" id="kal"></div>
        <div class="controls">
          <button class="btn primary" id="play"><span class="play-ico">▶</span> <span id="play-l">Play</span></button>
          <div class="stepper" aria-label="Speed">
            <button class="btn" id="slower" aria-label="Slower">−</button>
            <span id="speed"></span>
            <button class="btn" id="faster" aria-label="Faster">+</button>
          </div>
          <div class="stepper" aria-label="Text size">
            <button class="btn" id="smaller" aria-label="Smaller text">A−</button>
            <button class="btn" id="bigger" aria-label="Bigger text">A+</button>
          </div>
        </div>
      </div>
      ${
        !fits
          ? `<p class="notice">Some notes (shown faded) aren't on a ${model.label} kalimba. You can still play the rest.</p>`
          : shift
            ? `<p class="notice">Moved ${shift > 0 ? 'up' : 'down'} an octave to fit your ${model.label} kalimba.</p>`
            : ''
      }
      <div class="score" id="score" style="--scale:${settings.size}">
        ${parsed.lines
          .map((line) => `<div class="line">${line.map((bar) => `<span class="bar">${bar.map(evHtml).join('')}</span>`).join('')}</div>`)
          .join('')}
      </div>
      <p class="muted legend">Numbers match the tines. Dots above = higher tines, dots below = lower.
      Underlined = quick note, – = hold a beat longer. Tap any note to hear it.</p>
    </section>`;

  const kal = kalimbaPicture($('#kal'), {
    onTap(t) {
      pluck(t.freq);
      kal.flash(t.d);
    },
  });
  const score = $('#score');
  const evEls = [...score.querySelectorAll('.ev')];
  const speedEl = $('#speed');
  const showSpeed = () => (speedEl.textContent = `${innerWidth > 480 ? 'Speed ' : ''}${Math.round(settings.speed * 100)}%`);
  showSpeed();

  let playing = null;

  function stopPlayback() {
    if (!playing) return;
    cancelAnimationFrame(playing.raf);
    const c = audioCtx();
    playing.out.gain.setTargetAtTime(0, c.currentTime, 0.03);
    const out = playing.out;
    setTimeout(() => out.disconnect(), 400);
    evEls.forEach((e) => e.classList.remove('on'));
    kal.only(null);
    playing = null;
    $('#play-l').textContent = 'Play';
    $('.play-ico').textContent = '▶';
  }

  function startPlayback(from = 0) {
    stopPlayback();
    const c = audioCtx();
    const out = bus();
    const spb = 60 / (song.bpm * settings.speed);
    const t0 = parsed.events[from].t;
    const start = c.currentTime + 0.12;
    for (const ev of parsed.events.slice(from)) {
      if (ev.rest || !inRange(ev.d + shift)) continue;
      pluck(freqOf(ev.d + shift), start + (ev.t - t0) * spb, { dest: out, length: Math.max(0.8, Math.min(2.4, ev.beats * spb * 2)) });
    }
    playing = { out, raf: 0, idx: -1 };
    $('#play-l').textContent = 'Stop';
    $('.play-ico').textContent = '■';

    const endBeat = parsed.totalBeats;
    const tick = () => {
      if (!playing) return;
      const beat = t0 + (c.currentTime - start) / spb;
      if (beat >= endBeat + 0.5) {
        stopPlayback();
        return;
      }
      let i = playing.idx < 0 ? from : playing.idx;
      while (i + 1 < parsed.events.length && parsed.events[i + 1].t <= beat) i++;
      if (beat >= t0 && i !== playing.idx) {
        if (playing.idx >= 0) evEls[playing.idx].classList.remove('on');
        playing.idx = i;
        const el = evEls[i];
        el.classList.add('on');
        const ev = parsed.events[i];
        kal.only(ev.rest ? null : ev.d + shift);
        const r = el.getBoundingClientRect();
        const top = $('.song-top').getBoundingClientRect().bottom;
        if (r.top < top + 8 || r.bottom > innerHeight - 90) {
          scrollBy({ top: r.top - top - 60, behavior: 'smooth' });
        }
      }
      playing.raf = requestAnimationFrame(tick);
    };
    playing.raf = requestAnimationFrame(tick);
  }

  $('#play').onclick = () => (playing ? stopPlayback() : startPlayback(0));

  const setSpeed = (delta) => {
    settings.speed = Math.round(Math.max(0.4, Math.min(1.6, settings.speed + delta)) * 10) / 10;
    save();
    showSpeed();
    if (playing) startPlayback(Math.max(0, playing.idx));
  };
  $('#slower').onclick = () => setSpeed(-0.1);
  $('#faster').onclick = () => setSpeed(0.1);

  const setSize = (delta) => {
    settings.size = Math.round(Math.max(0.7, Math.min(2, settings.size + delta)) * 10) / 10;
    save();
    score.style.setProperty('--scale', settings.size);
  };
  $('#smaller').onclick = () => setSize(-0.15);
  $('#bigger').onclick = () => setSize(0.15);

  score.addEventListener('click', (e) => {
    const el = e.target.closest('.ev');
    if (!el) return;
    const i = Number(el.dataset.i);
    if (playing) return startPlayback(i);
    const ev = parsed.events[i];
    if (ev.rest) return;
    const d = ev.d + shift;
    pluck(freqOf(d));
    kal.flash(d);
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 350);
  });

  scrollTo(0, 0);
  keepAwake(true);
  return () => {
    stopPlayback();
    keepAwake(false);
  };
}

// ---------- Settings ----------

function settingsView() {
  const rangeOf = (id) => {
    const { tines } = kalimbaTines(id, settings.key);
    return `${tines[0].name} – ${tines[tines.length - 1].name}`;
  };
  const radio = (name, value, label, note = '') =>
    `<label class="opt"><input type="radio" name="${name}" value="${value}" ${String(settings[name]) === String(value) ? 'checked' : ''}>
     <span><b>${label}</b>${note ? `<small>${note}</small>` : ''}</span></label>`;

  view.innerHTML = `
    <section class="page settings">
      <h1>Settings</h1>

      <h2>Your kalimba</h2>
      <div class="opts" data-name="model">
        ${[17, 21, 10, 8].map((id) => radio('model', id, MODELS[id].label, [rangeOf(id), MODELS[id].note].filter(Boolean).join(' · '))).join('')}
      </div>

      <h2>Tuned to</h2>
      <p class="muted">Most kalimbas are in C: the long middle tine is a C.</p>
      <div class="seg" data-name="key">
        ${Object.keys(KEYS).map((k) => `<label><input type="radio" name="key" value="${k}" ${settings.key === k ? 'checked' : ''}><span>${k}</span></label>`).join('')}
      </div>

      <h2>Show notes as</h2>
      <div class="seg" data-name="labels">
        ${[['numbers', '1 2 3'], ['letters', 'C D E'], ['both', 'Both']]
          .map(([v, l]) => `<label><input type="radio" name="labels" value="${v}" ${settings.labels === v ? 'checked' : ''}><span>${l}</span></label>`)
          .join('')}
      </div>

      ${native ? '' : `<h2>Put it on the home screen</h2>
      <div class="card">
        <p><b>iPhone / iPad:</b> open this page in Safari, tap the Share button
        <svg class="inline" viewBox="0 0 24 24"><path d="M12 3v12M8 7l4-4 4 4M5 12v8h14v-8"/></svg>, then <b>Add to Home Screen</b>.</p>
        <p><b>Android:</b> open this page in Chrome, tap the <b>⋮</b> menu, then <b>Install app</b> or <b>Add to Home screen</b>.</p>
        <p class="muted">After the first visit it works without internet.</p>
      </div>`}

      <h2>How to read the songs</h2>
      <div class="card legend-card">
        <div><span class="ev"><span class="nt"><span class="glyph"><span class="dots"></span><span class="dg">1</span><span class="dots"></span></span></span></span> plain number: tines near the middle</div>
        <div><span class="ev"><span class="nt"><span class="glyph"><span class="dots">•</span><span class="dg">1</span><span class="dots"></span></span></span></span> dot above: the higher tine with that number</div>
        <div><span class="ev"><span class="nt"><span class="glyph u1"><span class="dots"></span><span class="dg">3</span><span class="dots"></span></span></span></span> underlined: quick note (half a beat)</div>
        <div><span class="ev"><span class="nt"><span class="glyph"><span class="dots"></span><span class="dg">5</span><span class="dots"></span></span></span><span class="hold">–</span></span> dash: hold for another beat</div>
        <div><span class="ev"><span class="nt"><span class="glyph"><span class="dots"></span><span class="dg">5</span><span class="dots"></span></span></span><span class="aug">·</span></span> dot after: hold half a beat longer</div>
        <div><span class="ev rest"><span class="glyph"><span class="dots"></span><span class="dg">0</span><span class="dots"></span></span></span> zero: rest (stay quiet)</div>
      </div>
    </section>`;

  view.querySelectorAll('input[type=radio]').forEach((input) =>
    input.addEventListener('change', () => {
      settings[input.name] = input.name === 'model' ? Number(input.value) : input.value;
      save();
      if (input.name === 'key') settingsView(); // ranges shown depend on the key
    }),
  );
}

// ---------- Router ----------

let cleanup = null;

function route() {
  if (cleanup) cleanup();
  cleanup = null;
  const [, page, arg] = (location.hash || `#/${settings.tab}`).split('/');
  const tab = page === 'song' ? 'songs' : page;
  document.querySelectorAll('.tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  if (page === 'tuner') cleanup = tunerView();
  else if (page === 'songs') songsView();
  else if (page === 'song') cleanup = songView(decodeURIComponent(arg || ''));
  else if (page === 'settings') settingsView();
  else return void (location.hash = '#/tuner');
  if (['tuner', 'songs', 'settings'].includes(tab) && settings.tab !== tab) {
    settings.tab = tab;
    save();
  }
}

window.addEventListener('hashchange', route);
// Android back button: from a song go back to the list, otherwise leave the app.
if (native) {
  window.Capacitor.nativeCallback('App', 'addListener', { eventName: 'backButton' }, () => {
    if (location.hash.startsWith('#/song/')) location.hash = '#/songs';
    else window.Capacitor.nativePromise('App', 'minimizeApp', {});
  });
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wantAwake) keepAwake(true);
});
route();

if (!native && 'serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
