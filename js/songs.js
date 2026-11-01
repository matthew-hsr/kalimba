// Song library. All melodies are traditional / public domain.
//
// Notation (see parseSong in music.js):
//   1-7 notes, 0 rest, ' up an octave, , down an octave,
//   _ half length, . dotted, - hold one more beat, | bar, / new line.
// `o` is the octave of plain digits: 1 (default) means plain "1" is the
// middle C5 tine on a 17-key C kalimba; 0 means the long centre C4 tine.
// `time` beats per bar use the notation's beat (eighths for 6/8).

export const CATEGORIES = ['Kids', 'Folk', 'Christmas', 'Hymns', 'Classical'];

export const SONGS = [
  // ---------- Kids ----------
  {
    id: 'twinkle', title: 'Twinkle Twinkle Little Star', cat: 'Kids', time: '4/4', bpm: 100,
    notes: `1 1 5 5 | 6 6 5- | 4 4 3 3 | 2 2 1-
            5 5 4 4 | 3 3 2- | 5 5 4 4 | 3 3 2-
            1 1 5 5 | 6 6 5- | 4 4 3 3 | 2 2 1-`,
  },
  {
    id: 'mary', title: 'Mary Had a Little Lamb', cat: 'Kids', time: '4/4', bpm: 110,
    notes: `3 2 1 2 | 3 3 3- | 2 2 2- | 3 5 5-
            3 2 1 2 | 3 3 3 3 | 2 2 3 2 | 1---`,
  },
  {
    id: 'row', title: 'Row, Row, Row Your Boat', cat: 'Kids', time: '6/8', bpm: 200,
    notes: `1-- 1-- | 1- 2 3-- | 3- 2 3- 4 | 5-----
            1' 1' 1' 5 5 5 | 3 3 3 1 1 1 | 5- 4 3- 2 | 1-----`,
  },
  {
    id: 'frere', title: 'Frère Jacques (Are You Sleeping)', cat: 'Kids', time: '4/4', bpm: 110,
    notes: `1 2 3 1 | 1 2 3 1 | 3 4 5- | 3 4 5-
            5_ 6_ 5_ 4_ 3 1 | 5_ 6_ 5_ 4_ 3 1 | 1 5, 1- | 1 5, 1-`,
  },
  {
    id: 'london', title: 'London Bridge Is Falling Down', cat: 'Kids', time: '4/4', bpm: 110,
    notes: `5. 6_ 5 4 | 3 4 5- | 2 3 4- | 3 4 5-
            5. 6_ 5 4 | 3 4 5- | 2- 5- | 3 1--`,
  },
  {
    id: 'macdonald', title: 'Old MacDonald Had a Farm', cat: 'Kids', time: '4/4', bpm: 120,
    notes: `1 1 1 5, | 6, 6, 5,- | 3 3 2 2 | 1-- 5,
            1 1 1 5, | 6, 6, 5,- | 3 3 2 2 | 1-- 5,_ 5,_
            1 1 1 5,_ 5,_ | 1 1 1- | 1_ 1_ 1 1_ 1_ 1 | 1_ 1_ 1_ 1_ 1 1
            1 1 1 5, | 6, 6, 5,- | 3 3 2 2 | 1---`,
  },
  {
    id: 'hotcross', title: 'Hot Cross Buns', cat: 'Kids', time: '4/4', bpm: 100,
    notes: `3 2 1- | 3 2 1- | 1_ 1_ 1_ 1_ 2_ 2_ 2_ 2_ | 3 2 1-`,
  },
  {
    id: 'oldman', title: 'This Old Man', cat: 'Kids', time: '4/4', bpm: 112,
    notes: `5 3 5- | 5 3 5- | 6 5 4 3 | 2 3 4-
            3_ 4_ 5 1 1_ 1_ | 1 1_ 2_ 3_ 4_ 5 | 5 2 2 4 | 3 2 1-`,
  },
  {
    id: 'wheels', title: 'The Wheels on the Bus', cat: 'Kids', time: '4/4', bpm: 120,
    notes: `5, | 1 1_ 1_ 1 3 | 5 3 1- | 2 7, 5,- | 5 3 1 5,
            1 1_ 1_ 1 3 | 5 3 1- | 2- 5,- | 1---`,
  },
  {
    id: 'lightly', title: 'Lightly Row', cat: 'Kids', time: '4/4', bpm: 110,
    notes: `5 3 3- | 4 2 2- | 1 2 3 4 | 5 5 5-
            5 3 3- | 4 2 2- | 1 3 5 5 | 3---
            2 2 2 2 | 2 3 4- | 3 3 3 3 | 3 4 5-
            5 3 3- | 4 2 2- | 1 3 5 5 | 1---`,
  },
  {
    id: 'alouette', title: 'Alouette', cat: 'Kids', time: '4/4', bpm: 110,
    notes: `1. 2_ 3 3 | 2_ 1_ 2_ 3_ 1 5,
            1. 2_ 3 3 | 2_ 1_ 2_ 3_ 1-`,
  },
  {
    id: 'auclair', title: 'Au Clair de la Lune', cat: 'Kids', time: '4/4', bpm: 100,
    notes: `1 1 1 2 | 3- 2- | 1 3 2 2 | 1---
            1 1 1 2 | 3- 2- | 1 3 2 2 | 1---
            2 2 2 2 | 6,- 6,- | 2 1 7, 6, | 5,---
            1 1 1 2 | 3- 2- | 1 3 2 2 | 1---`,
  },
  {
    id: 'avignon', title: "Sur le Pont d'Avignon", cat: 'Kids', time: '2/4', bpm: 100,
    notes: `1_ 1_ 1 | 2_ 2_ 2 | 3_ 4_ 5_ 1_ | 7,_ 1_ 2_ 5,_
            1_ 1_ 1 | 2_ 2_ 2 | 3_ 4_ 5_ 1_ | 2_ 7,_ 1`,
  },

  // ---------- Folk ----------
  {
    id: 'birthday', title: 'Happy Birthday', cat: 'Folk', time: '3/4', bpm: 100,
    notes: `5,_. 5,__ | 6, 5, 1 | 7,- 5,_. 5,__ | 6, 5, 2 | 1- 5,_. 5,__
            5 3 1 | 7, 6, 4_. 4__ | 3 1 2 | 1--`,
  },
  {
    id: 'yankee', title: 'Yankee Doodle', cat: 'Folk', time: '4/4', bpm: 120,
    notes: `1_ 1_ 2_ 3_ 1_ 3_ 2_ 5,_ | 1_ 1_ 2_ 3_ 1 7, | 1_ 1_ 2_ 3_ 4_ 3_ 2_ 1_ | 7,_ 5,_ 6,_ 7,_ 1 1
            6,_ 7,_ 6,_ 5,_ 6,_ 7,_ 1 | 5,_ 6,_ 5,_ 4,_ 3, 5, | 6,_ 7,_ 6,_ 5,_ 6,_ 7,_ 1_ 6,_ | 5,_ 1_ 7,_ 2_ 1 1`,
  },
  {
    id: 'saints', title: 'When the Saints Go Marching In', cat: 'Folk', time: '4/4', bpm: 140,
    notes: `0 1 3 4 | 5--- | 0 1 3 4 | 5---
            0 1 3 4 | 5- 3- | 1- 3- | 2---
            0 3 3 2 | 1-- 1 | 3- 5 5 | 4-- 3_ 4_
            5- 3- | 1- 2- | 1---`,
  },
  {
    id: 'auld', title: 'Auld Lang Syne', cat: 'Folk', time: '4/4', bpm: 90,
    notes: `5, | 1. 1_ 1 3 | 2. 1_ 2 3 | 1. 1_ 3 5 | 6-- 6
            5. 3_ 3 1 | 2. 1_ 2 3 | 1. 6,_ 6, 5, | 1-- 6
            5. 3_ 3 1 | 2. 1_ 2 6 | 5. 3_ 3 5 | 6-- 1'
            5. 3_ 3 1 | 2. 1_ 2 3 | 1. 6,_ 6, 5, | 1---`,
  },
  {
    id: 'susanna', title: 'Oh! Susanna', cat: 'Folk', time: '4/4', bpm: 120,
    notes: `1_ 2_ | 3 5 5. 6_ | 5 3 1. 2_ | 3 3 2 1 | 2-- 1_ 2_
            3 5 5. 6_ | 5 3 1. 2_ | 3 3 2 2 | 1-- 0
            4- 6- | 6- 5 5 | 3 1 2 1_ 2_
            3 5 5. 6_ | 5 3 1. 2_ | 3 3 2 2 | 1---`,
  },
  {
    id: 'clementine', title: 'Oh My Darling, Clementine', cat: 'Folk', time: '3/4', bpm: 100,
    notes: `1_. 1__ 1 5, | 3_. 3__ 3 1 | 1_. 3__ 5 5 | 4_ 3_ 2-
            2_. 3__ 4 4 | 3_. 2__ 3 1 | 1_. 3__ 2 5, | 7,_. 2__ 1-`,
  },
  {
    id: 'kumbaya', title: 'Kumbaya', cat: 'Folk', time: '4/4', bpm: 90,
    notes: `1 3 5 5 | 5- 6 6 | 5---
            1 3 5 5 | 5- 4 3 | 2---
            1 3 5 5 | 5- 6 6 | 5---
            4- 3- | 2 2 1-`,
  },
  {
    id: 'michael', title: 'Michael, Row the Boat Ashore', cat: 'Folk', time: '4/4', bpm: 100,
    notes: `1 3 5- | 3_ 5_ 6 5- | 3 5 6- | 5---
            3 5 5- | 3_ 4_ 3 2- | 1 2 3- | 2 1--`,
  },
  {
    id: 'bonnie', title: 'My Bonnie Lies Over the Ocean', cat: 'Folk', time: '3/4', bpm: 120,
    notes: `5, | 3 2 1 | 2 1 6, | 5,- 3, | 3,- 5,
            3 2 1 | 1 7, 1 | 2-- | 2- 5,
            3 2 1 | 2 1 6, | 5,- 3, | 3,- 5,
            6, 2 1 | 7, 6, 7, | 1-- | 1--`,
  },
  {
    id: 'sakura', title: 'Sakura Sakura', cat: 'Folk', time: '4/4', bpm: 80,
    notes: `6 6 7- | 6 6 7- | 6 7 1' 7 | 6 7_ 6_ 4-
            3 1 3 4 | 3 3_ 1_ 7,- | 6 7 1' 7 | 6 7_ 6_ 4-
            3 1 3 4 | 3 3_ 1_ 7,- | 6 6 7- | 6 6 7-
            3 4 7_ 6_ 4 | 3---`,
  },
  {
    id: 'auralee', title: 'Aura Lee (Love Me Tender tune)', cat: 'Folk', time: '4/4', bpm: 90,
    notes: `5, 1 7, 1 | 2 6, 2- | 1 7, 6, 7, | 1---
            5, 1 7, 1 | 2 6, 2- | 1 7, 6, 7, | 1---
            3 3 3- | 3 3 3- | 3 2 1 2 | 3---
            3 3 4 3 | 2 6, 2- | 1 7, 3 2 | 1---`,
  },

  // ---------- Christmas ----------
  {
    id: 'jingle', title: 'Jingle Bells', cat: 'Christmas', time: '4/4', bpm: 130,
    notes: `3 3 3- | 3 3 3- | 3 5 1. 2_ | 3---
            4 4 4. 4_ | 4 3 3 3_ 3_ | 3 2 2 3 | 2- 5-
            3 3 3- | 3 3 3- | 3 5 1. 2_ | 3---
            4 4 4. 4_ | 4 3 3 3_ 3_ | 5 5 4 2 | 1---`,
  },
  {
    id: 'silent', title: 'Silent Night', cat: 'Christmas', time: '6/8', bpm: 150, o: 0,
    notes: `5. 6_ 5 3-- | 5. 6_ 5 3-- | 2'- 2' 7-- | 1'- 1' 5--
            6- 6 1'. 7_ 6 | 5. 6_ 5 3-- | 6- 6 1'. 7_ 6 | 5. 6_ 5 3--
            2'- 2' 4'. 2'_ 7 | 1'-- 3'-- | 1' 5 3 5. 4_ 2 | 1-----`,
  },
  {
    id: 'deck', title: 'Deck the Halls', cat: 'Christmas', time: '4/4', bpm: 120,
    notes: `5. 4_ 3 2 | 1 2 3 1 | 2_ 3_ 4_ 2_ 3. 2_ | 1 7, 1-
            5. 4_ 3 2 | 1 2 3 1 | 2_ 3_ 4_ 2_ 3. 2_ | 1 7, 1-
            2. 3_ 4 2 | 3. 4_ 5 2 | 3_ 4_ 5 6_ 7_ 1' | 7 6 5-
            5. 4_ 3 2 | 1 2 3 1 | 6_ 6_ 6_ 6_ 5. 4_ | 3 2 1-`,
  },
  {
    id: 'wewish', title: 'We Wish You a Merry Christmas', cat: 'Christmas', time: '3/4', bpm: 120,
    notes: `5, | 1 1_ 2_ 1_ 7,_ | 6, 6, 6, | 2 2_ 3_ 2_ 1_ | 7, 5, 5,
            3 3_ 4_ 3_ 2_ | 1 6, 5,_ 5,_ | 6, 2 7, | 1--`,
  },
  {
    id: 'wenceslas', title: 'Good King Wenceslas', cat: 'Christmas', time: '4/4', bpm: 110,
    notes: `1 1 1 2 | 1 1 5,- | 6, 5, 6, 7, | 1- 1-
            1 1 1 2 | 1 1 5,- | 6, 5, 6, 7, | 1- 1-
            5 4 3 2 | 3 2 1- | 6, 5, 6, 7, | 1- 1-
            5, 5, 6, 7, | 1 1 2- | 5 4 3 2 | 1- 4- | 1---`,
  },
  {
    id: 'noel', title: 'The First Noel', cat: 'Christmas', time: '3/4', bpm: 110,
    notes: `3_ 2_ | 1. 2_ 3_ 4_ | 5- 6_ 7_ | 1' 7 6 | 5- 6_ 7_
            1' 7 6 | 5 6 7 | 1' 5 4 | 3- 3_ 2_
            1. 2_ 3_ 4_ | 5- 6_ 7_ | 1' 7 6 | 5- 6_ 7_
            1' 7 6 | 5 6 7 | 1' 5 4 | 3- 3_ 2_
            1. 2_ 3_ 4_ | 5- 1'_ 7_ | 6- 6 | 5--
            1' 7 6 | 5 6 7 | 1' 5 4 | 3--`,
  },
  {
    id: 'angels', title: 'Angels We Have Heard on High', cat: 'Christmas', time: '4/4', bpm: 110,
    notes: `3 3 3 5 | 5. 4_ 3- | 3 2 3 5 | 3. 2_ 1-
            3 3 3 5 | 5. 4_ 3- | 3 2 3 5 | 3. 2_ 1-
            5- 6_ 5_ 4_ 3_ | 4- 5_ 4_ 3_ 2_ | 3- 4_ 3_ 2_ 1_ | 2- 5, 5,
            1 2 3 4 | 3- 2-
            5- 6_ 5_ 4_ 3_ | 4- 5_ 4_ 3_ 2_ | 3- 4_ 3_ 2_ 1_ | 2- 5, 5,
            1 2 3 4 | 3- 2- | 1---`,
  },

  // ---------- Hymns ----------
  {
    id: 'grace', title: 'Amazing Grace', cat: 'Hymns', time: '3/4', bpm: 80,
    notes: `5, | 1- 3_ 1_ | 3- 2 | 1- 6, | 5,- 5,
            1- 3_ 1_ | 3- 2 | 5-- | 5- 3
            5- 3_ 1_ | 3- 2 | 1- 6, | 5,- 5,
            1- 3_ 1_ | 3- 2 | 1--`,
  },
  {
    id: 'old100', title: 'Doxology (Old Hundredth)', cat: 'Hymns', time: '4/4', bpm: 80,
    notes: `1- 1 7, | 6, 5, 1 2 | 3---
            3- 3 3 | 2 1 4 3 | 2---
            1- 2 3 | 2 1 6, 7, | 1---
            5- 3 1 | 2 4 3 2 | 1---`,
  },
  {
    id: 'jesusloves', title: 'Jesus Loves Me', cat: 'Hymns', time: '4/4', bpm: 100,
    notes: `5 3 3 2 | 3 5 5- | 6 6 1' 6 | 6 5 5-
            5 3 3 2 | 3 5 5- | 6 6 5 1 | 3 2 1-
            5- 3 5 | 6 1'-- | 5- 3 1 | 3 2--
            5- 3 5 | 6 1'-- | 6 5 1 3 | 2- 1-`,
  },

  // ---------- Classical ----------
  {
    id: 'odetojoy', title: 'Ode to Joy (Beethoven)', cat: 'Classical', time: '4/4', bpm: 110,
    notes: `3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 3. 2_ 2-
            3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2. 1_ 1-
            2 2 3 1 | 2 3_ 4_ 3 1 | 2 3_ 4_ 3 2 | 1 2 5,-
            3 3 4 5 | 5 4 3 2 | 1 1 2 3 | 2. 1_ 1-`,
  },
  {
    id: 'brahms', title: "Brahms' Lullaby", cat: 'Classical', time: '3/4', bpm: 90, o: 0,
    notes: `3_ 3_ | 5- 3_ 3_ | 5- 3_ 5_ | 1' 7. 6_ | 6 5 2_ 3_
            4 2 2_ 3_ | 4- 2_ 4_ | 7_ 6_ 5 7 | 1'- 1_ 1_
            1'- 6_ 4_ | 5- 3_ 1_ | 4 5 6 | 5- 1_ 1_
            1'- 6_ 4_ | 5- 3_ 1_ | 4 3 2 | 1--`,
  },
  {
    id: 'canon', title: 'Canon in D (Pachelbel, theme)', cat: 'Classical', time: '4/4', bpm: 70,
    notes: `3'- 2'- | 1'- 7- | 6- 5- | 6- 7-
            1' 7 6 5 | 4 3 4 2 | 1 3 5 4 | 3 1 3 2
            1 6, 1 5, | 4, 6, 5, 4, | 3 1 2 7, | 1---`,
  },
  {
    id: 'minuet', title: 'Minuet in G (Petzold)', cat: 'Classical', time: '3/4', bpm: 110,
    notes: `5 1_ 2_ 3_ 4_ | 5 1 1 | 6 4_ 5_ 6_ 7_ | 1' 1 1
            4 5_ 4_ 3_ 2_ | 3 4_ 3_ 2_ 1_ | 7, 1_ 2_ 3_ 1_ | 2--
            5 1_ 2_ 3_ 4_ | 5 1 1 | 6 4_ 5_ 6_ 7_ | 1' 1 1
            4 5_ 4_ 3_ 2_ | 3 4_ 3_ 2_ 1_ | 2 3_ 2_ 1_ 7,_ | 1--`,
  },
  {
    id: 'largo', title: "Going Home (Dvořák's New World Largo)", cat: 'Classical', time: '4/4', bpm: 60,
    notes: `3. 5_ 5- | 3. 2_ 1- | 2. 3_ 5. 3_ | 2---
            3. 5_ 5- | 3. 2_ 1- | 2. 3_ 2. 1_ | 1---`,
  },
];
