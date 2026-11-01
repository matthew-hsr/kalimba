// Checks every song parses, every full bar has the right number of beats
// (first/last bars may be pickups), and every note fits a 17-key kalimba.
import { SONGS, CATEGORIES } from '../js/songs.js';
import { parseSong, fitShift } from '../js/music.js';

let problems = 0;
const ids = new Set();
for (const s of SONGS) {
  const fail = (msg) => { problems++; console.log(`${s.id}: ${msg}`); };
  if (ids.has(s.id)) fail('duplicate id');
  ids.add(s.id);
  if (!CATEGORIES.includes(s.cat)) fail(`unknown category ${s.cat}`);
  let song;
  try { song = parseSong(s.notes, s.o ?? 1); } catch (e) { fail(e.message); continue; }
  const perBar = Number(s.time.split('/')[0]);
  const bars = song.lines.flat();
  bars.forEach((bar, i) => {
    const beats = bar.reduce((a, e) => a + e.beats, 0);
    const edge = i === 0 || i === bars.length - 1;
    if (edge ? beats > perBar + 1e-9 : Math.abs(beats - perBar) > 1e-9)
      fail(`bar ${i + 1} has ${beats} beats, expected ${perBar}: ${bar.map((e) => e.beats).join(' ')}`);
  });
  const fit = fitShift(song.events, 17);
  if (!fit.fits || fit.shift !== 0) fail(`does not fit a 17-key kalimba as written (shift ${fit.shift})`);
}
console.log(`songs: ${SONGS.length} checked, ${problems} problems`);
process.exit(problems ? 1 : 0);
