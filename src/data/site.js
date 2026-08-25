/* Site-wide links and the copy that is not tied to a single figure. */

export const YOUTUBE_URL = 'https://www.youtube.com/@figuringthingsout';
export const GITHUB_URL = 'https://github.com/KyleKaminky';
export const LINKEDIN_URL = 'https://www.linkedin.com/in/kyle-kaminky/';

export const ABOUT = [
  'I am an engineer working in mission systems and software, with a long-running interest in RF, signals and machine learning. Most of what is on this site started as a way of understanding something myself.',
  'For a long time I wanted to make educational animations and never knew the right tool for it. I found Processing, and began this set and the associated channels not long after.',
  'My hope is that I can use aesthetically pleasing visualizations and animations to inspire others to learn, create, admire and figure things out.',
];

/*
   Non-animation work. Copy carried over from the previous kylekaminky.github.io,
   lightly tightened — the voice is Kyle's own.
*/
export const PROJECTS = [
  {
    kicker: 'Visualization',
    title: 'Educational animations',
    blurb:
      'My personality type is Enneagram 5, which basically means I love learning — and because I love ' +
      'learning, I love helping other people learn too. I always wanted to make visualizations and never ' +
      'knew the right language for it. Then I found Processing and fell in love. While my wife studied ' +
      'for the PE exam I spent hours making these.',
    tag: 'Processing · p5.js',
    href: '#/',
  },
  {
    kicker: 'Machine learning',
    title: 'Kaggle March Madness',
    blurb:
      'After finishing the Coursera deep learning courses I put the skills to the test in the March ' +
      'Madness competition on Kaggle, and finished in the top 3%. I wrote up the approach and the ' +
      'project details in a notebook.',
    tag: 'Top 3%',
  },
  {
    kicker: 'Hardware',
    title: 'Software defined radio',
    blurb:
      'I got my first SDR just after graduating and still enjoy tinkering with them — signal surveys, ' +
      'analysis, seeing what is out there. It started with an RTL-SDR, receive only. I now have two ' +
      'HackRF Ones, which transmit as well, which gets a lot more interesting. After GRCon 2022 I ran a ' +
      'replay attack on my own wireless ceiling fan.',
    tag: 'RTL-SDR · HackRF One',
  },
  {
    kicker: 'Fabrication',
    title: '3D printing',
    blurb:
      'My first real exposure to 3D printing was at Ball Aerospace. Once I saw what they could make I ' +
      'bought an Ender 3 Pro and have really enjoyed it. I have designed a number of pieces, my ' +
      'favourite being a custom controller for a remote control crane.',
    tag: 'Ender 3 Pro',
  },
];

export const POSTS = [
  { date: '2026', title: 'Placeholder post', blurb: 'Replace with real writing.' },
];
