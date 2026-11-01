# Kalimba Tuner & Songs

A no-nonsense kalimba app for iPhone, iPad and Android. It's an installable
web app (PWA): no app store, no account, no ads. It works offline after the
first visit.

- **Tuner**: tap *Start tuner* and pluck a tine. The app shows which tine it heard,
  how many cents off it is, and which way to tap the tine. Checked tines get a
  green tick on the kalimba picture. Tap a tine in the picture to hear how it
  should sound.
- **Songs**: 39 public-domain songs written as kalimba number tabs. *Play*
  plays the song and lights up each note and tine as it goes. *− / +* change the speed,
  *A− / A+* change the text size, and tapping a note plays it.
- **Settings**: kalimba size (17 / 21 / 10 / 8 keys), the key it's tuned to,
  and whether to show numbers, letters or both.

## Hosting

The microphone only works over **https**, so the app has to be hosted. It's
plain static files with no build step. Any static host works:

- **GitHub Pages**: push this folder to a repo, then Settings → Pages → deploy from branch.
- **Netlify Drop**: drag this folder onto https://app.netlify.com/drop.

Then open the URL on the phone or tablet and add it to the home screen
(iPhone/iPad: Safari → Share → *Add to Home Screen*; Android: Chrome → ⋮ → *Install app*).

To run it locally: `python3 -m http.server 8765` and open http://localhost:8765.

## iOS and Android apps

The same web code is wrapped as native apps with [Capacitor](https://capacitorjs.com)
(`ios/`, `android/`). App id: `com.matthewhsr.kalimba`.

```
npm install
npm run sync          # copies the web files into www/ and into both native projects
```

Run `npm run sync` after every change to the web files.

- **iOS**: `npx cap open ios`, pick a device or simulator, press Run. For the App Store:
  Product → Archive → Distribute App → App Store Connect.
- **Android**: `npx cap open android`, press Run. For Google Play, build a signed bundle:
  `cd android && ./gradlew bundleRelease` → `android/app/build/outputs/bundle/release/app-release.aab`.
  Signing reads `android/keystore.properties` (not in git), which points at the upload key.
  Keep a backup of the key and its password.

To publish an update, raise `versionCode` / `versionName` in `android/app/build.gradle`
and the version and build number in Xcode, then sync and build again.

Native differences, all in `js/app.js` behind `native`:
- the screen-awake code uses `@capacitor-community/keep-awake`
- the Android back button goes from a song back to the list, otherwise leaves the app (`@capacitor/app`)
- the service worker and the home-screen instructions are skipped

The privacy policy for the store listings is `privacy.html`
(https://matthew-hsr.github.io/kalimba/privacy.html).

Icons and splash screens: `node tools/make-icons.mjs`, then
`npx @capacitor/assets@3.0.5 generate --ios --android --iconBackgroundColor '#b07c52' --splashBackgroundColor '#f7f1e8' --splashBackgroundColorDark '#1b1713'`.

## Adding songs

Songs live in `js/songs.js`, one object per song. The notation:

| Write | Means |
|---|---|
| `1`–`7` | scale notes (the numbers on the tines); `0` = rest |
| `'` / `,` | one octave up / down (repeatable) |
| `_` | half as long (`__` = quarter as long) |
| `.` | dotted (1.5× as long) |
| `-` | hold one more beat each |
| `\|` | bar line |
| new line or `/` | new line on screen |

`o: 1` (the default) means a plain `1` is the C5 tine, which has one dot on a
17-key C kalimba. Use `o: 0` to make plain `1` the long centre C4 tine.

After editing, run the checks. They confirm every bar has the right number of
beats and every note fits on a 17-key kalimba:

```
node tests/songs.test.mjs
node tests/pitch.test.mjs
```

Bump `CACHE` in `sw.js` when you change files so installed copies pick up the update.

## Files

- `js/pitch.js`: pitch detection (YIN, plus a band-pass second pass that removes the kalimba's inharmonic overtone)
- `js/music.js`: note math, kalimba layouts, tab parser
- `js/audio.js`: kalimba synth and microphone
- `js/app.js`: screens
- `js/songs.js`: song library
- `tools/make-icons.mjs`: regenerates the app icons and splash sources (`assets/`)
- `tools/build-www.mjs`: copies the web app into `www/` for Capacitor
