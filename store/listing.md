# Store listing

Text and answers for App Store Connect and the Google Play Console.
Screenshots are in `screenshots/` (iphone 1320×2868, ipad 2064×2752, android 1080×1920).
The Play feature graphic is `feature-graphic.png` (1024×500); edit `feature-graphic.html` and re-render it to change it.

## Shared

- **Name / title:** Kalimba Tuner & Songs
- **Category:** Music
- **Price:** Free, no in-app purchases, no ads
- **Privacy policy URL:** https://matthew-hsr.github.io/kalimba/privacy.html
- **Support URL:** https://github.com/matthew-hsr/kalimba
- **Contact email:** your developer account email

## App Store

- **Subtitle:** Tune your kalimba, play songs
- **Promotional text:**
  A tuner that tells you exactly which way to tap each tine, and 39 well-known songs written as easy kalimba number tabs.
- **Keywords:** thumb piano,mbira,tabs,tablature,sheet music,tuning,17 key,chromatic,instrument,beginner,karimba

### Description (App Store and Google Play)

A simple, no-nonsense app for kalimba players.

TUNER
Pluck a tine and the app shows which note it heard, how far off it is, and which way to adjust it: too low means tap the tine shorter, too high means tap it longer. Tines you have tuned get a green tick on a picture of your kalimba, so you can see at a glance what is left. Tap any tine in the picture to hear how it should sound.

SONGS
39 well-known songs, written as kalimba number tabs that match the numbers on your tines: children's songs, folk songs, Christmas carols, hymns and classical pieces, from Twinkle Twinkle Little Star and Amazing Grace to Silent Night and Ode to Joy.
• Press Play to hear a song and watch each note and tine light up as it goes
• Slow it down or speed it up
• Make the notes bigger or smaller
• Tap any note to hear it
• The screen stays on while you play

WORKS WITH YOUR KALIMBA
17 keys (the most common), 21, 10 or 8 keys, tuned to C, D, E, F, G, A or B. Show notes as numbers, letters or both.

NO NONSENSE
No ads, no account, no tracking. Works without internet. Nothing you play is recorded or sent anywhere.

### App Privacy (nutrition label)

- Data collection: **No, we do not collect data from this app.**
  (The microphone is analysed on the device and never stored or sent.)

### Other answers

- **Age rating:** answer "None" to every question → 4+
- **Export compliance:** already answered in the app (`ITSAppUsesNonExemptEncryption` = NO), so App Store Connect won't ask
- **Sign-in required:** No
- **Review notes:** "The tuner needs the microphone. Pluck a kalimba, or play a sustained note near the phone. No account is needed."
- **Devices:** iPhone and iPad

## Google Play

- **Short description:** Simple kalimba tuner plus 39 songs in easy number tabs. No ads, no account.
- **Full description:** the description above
- **App or game:** App. **Free.**
- **Ads:** No ads
- **App access:** All functionality is available without special access
- **Content rating questionnaire:** category "All other app types", answer No to everything → Everyone
- **Target audience:** 13 and over. Don't choose the under-13 groups: that puts the app in Google's Families program, which has extra requirements
- **Data safety:** No data collected, no data shared
  (Audio is processed only on the device and never leaves it; Google's guidance does not count that as collection.)
- **Government app / financial features / health:** No
- **Testing:** new personal accounts need a closed test with at least 12 testers opted in for 14 days in a row before production access

## Releasing

1. **iOS:** `npm run sync`, `npx cap open ios`, set the run target to "Any iOS Device", Product → Archive → Distribute App → App Store Connect.
   Create the app record in App Store Connect first (bundle id `com.matthewhsr.kalimba`).
2. **Android:** `npm run sync`, `cd android && ./gradlew bundleRelease`, upload
   `android/app/build/outputs/bundle/release/app-release.aab` to a closed testing track and accept Play App Signing.
