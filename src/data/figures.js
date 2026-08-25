/*
   Figure registry — the single source of truth for the whole site.

   The index grid, the sheets, prev/next order and every parameter slider are
   driven from this table. Adding an animation means adding one entry here and
   one module in src/sketches/ — no layout edits anywhere.

   Entry shape:
     id      stable slug, also the URL segment (/figures/signal)
     num     zero-padded, displayed as "Fig. 07"
     title   display title
     domain  subject area, shown in the meta row

   Status is deliberately NOT stored here. It is derived from whether the
   figure has a sketch registered in src/sketches/index.js, so porting an
   animation flips it to 'Live' on its own and the two can never disagree.
     blurb   one line, index card only
     notes   paragraphs shown on the sheet — Kyle's own copy, kept verbatim
     params  sliders: { key, label, min, max, step, def, unit? }
     video   YouTube URL for the "Watch the video" button
     source  GitHub URL for the "View source" button
*/

export const FIGS = [
  { id: 'intro', num: '01', title: 'Introduction', domain: 'Overview',
    blurb: 'Why this set exists — visualizations as an invitation to figure things out.',
    notes: ['For a long time I have wanted to make educational animations. I finally began this blog and associated social media accounts after discovering Processing.', 'My hope is that I can use aesthetically pleasing visualizations and animations to inspire others to learn, create, admire and figure things out.'],
    params: [{ key: 'rings', label: 'Rings', min: 3, max: 14, step: 1, def: 8 }, { key: 'speed', label: 'Speed', min: 1, max: 100, step: 1, def: 30, unit: '%' }],
    video: 'https://www.youtube.com/watch?v=0v2ZmaTAQ8k', source: 'https://github.com/KyleKaminky/FTOIntro' },
  { id: 'binary', num: '02', title: 'Binary clock', domain: 'Digital logic',
    blurb: 'Each column is one decimal digit of the time; the bottom bit is least significant.',
    notes: ['Although it might not be the most practical way to view the time, it is a great way to become more familiar with binary numbers in a mesmerizing way.', 'Each column represents one digit of a standard decimal clock, with the bottom bit being the least significant bit.'],
    params: [{ key: 'gap', label: 'Column spacing', min: 100, max: 200, step: 5, def: 128, unit: '%' }, { key: 'labels', label: 'Decimal labels', min: 0, max: 1, step: 1, def: 1 }],
    video: 'https://www.youtube.com/watch?v=NVbR8fG1ZVo', source: 'https://github.com/KyleKaminky/BinaryClock' },
  { id: 'monte', num: '03', title: 'Estimating π by Monte Carlo', domain: 'Probability',
    blurb: 'Random points in a square estimate π from the fraction landing inside the circle.',
    notes: ['Monte Carlo simulations use random variables and/or sampling to determine numerical results.', 'This estimates π by generating random (X,Y) points between -1 and 1. The estimate follows from the number of points inside the unit circle and the total generated.'],
    params: [{ key: 'rate', label: 'Points per frame', min: 1, max: 60, step: 1, def: 8 }, { key: 'cap', label: 'Points before reset', min: 500, max: 20000, step: 500, def: 6000 }],
    video: 'https://www.youtube.com/watch?v=ImBKpB2VVs8', source: 'https://github.com/KyleKaminky/MonteCarloPi' },
  { id: 'ook', num: '04', title: 'On-off keying', domain: 'Communications',
    blurb: 'The simplest modulation: the carrier is switched fully on or fully off.',
    notes: ['In wireless communication systems, information — typically a series of 1s and 0s — is modulated onto some carrier signal. Modulation means varying some property of the carrier to imprint this information.', 'On-off keying is one of the simplest modulation types. It varies the amplitude, either completely on or off.'],
    params: [{ key: 'bits', label: 'Bits on screen', min: 4, max: 12, step: 1, def: 8 }, { key: 'carrier', label: 'Carrier cycles per bit', min: 1, max: 10, step: 1, def: 6 }, { key: 'speed', label: 'Bit rate', min: 1, max: 12, step: 1, def: 3, unit: ' bits/s' }],
    video: 'https://www.youtube.com/watch?v=Ax4JNUpdoDA', source: 'https://github.com/KyleKaminky/OOK' },
  { id: 'generative', num: '05', title: 'Generative art', domain: 'Algorithms',
    blurb: 'Algorithms and mathematics as a drawing hand — a harmonograph stand-in until the port lands.',
    notes: ['Generative art is an exciting field that uses algorithms, mathematics, and autonomous systems to create works of art.', 'The original sketch recreates an image with somewhat random white lines based on the brightness of each pixel. This placeholder draws a harmonograph while that port is in progress.'],
    params: [{ key: 'a', label: 'Ratio A', min: 1, max: 9, step: 1, def: 3 }, { key: 'b', label: 'Ratio B', min: 1, max: 9, step: 1, def: 4 }, { key: 'trail', label: 'Trail length', min: 40, max: 700, step: 20, def: 260 }],
    video: 'https://www.youtube.com/watch?v=NQefxmaMzA8', source: 'https://github.com/KyleKaminky/PhotoMaker' },
  { id: 'birthday', num: '06', title: 'Birthday paradox simulator', domain: 'Probability',
    blurb: 'In 23 random people there is a 50% chance two share a birthday. Watch it happen.',
    notes: ['Did you know, in a group of only 23 random people, there is a 50% chance that two of them have the same birthday?', 'This is called the birthday paradox and is based on the pigeonhole principle found in probability and statistics. The animation performs rounds of the experiment by generating random birthdays and looking for a match.'],
    params: [{ key: 'group', label: 'Group size', min: 5, max: 60, step: 1, def: 23 }, { key: 'speed', label: 'Draw rate', min: 1, max: 30, step: 1, def: 6 }],
    video: 'https://www.youtube.com/watch?v=CJInW0bYiOk', source: 'https://github.com/KyleKaminky/BirthdayParadox' },
  { id: 'signal', num: '07', title: 'Signal types', domain: 'Signal processing',
    blurb: 'Analog vs digital, continuous vs discrete — the four combinations side by side.',
    notes: ['In digital signal processing it is important to understand the difference between analog and digital signals, as well as continuous and discrete signals.', 'Analog signals can be of any Y value, and digital signals can only be at certain levels of Y. Discrete signals only have values at certain time steps; continuous signals have values across all time.'],
    params: [{ key: 'levels', label: 'Quantization levels', min: 2, max: 16, step: 1, def: 6 }, { key: 'rate', label: 'Sample rate', min: 6, max: 60, step: 2, def: 20 }],
    video: 'https://www.youtube.com/watch?v=WTIIApMmSHY', source: 'https://github.com/KyleKaminky/SignalTypes' },
  { id: 'counting', num: '08', title: 'Counting', domain: 'Number systems',
    blurb: 'The same count in decimal, binary, octal and hex — only the symbol count changes.',
    notes: ['The most common way to count uses 10 symbols, which is also called the decimal system. But computers and much other technology use different systems — such as binary, octal, and hexadecimal.', 'What really matters and makes these different is the number of symbols. The concept of counting does not change, only the number of symbols used.'],
    params: [{ key: 'speed', label: 'Count rate', min: 1, max: 30, step: 1, def: 6 }, { key: 'top', label: 'Count to', min: 16, max: 512, step: 16, def: 256 }],
    video: 'https://www.youtube.com/watch?v=6DrFBTl9vWU', source: 'https://github.com/KyleKaminky/Counting' },
  { id: 'orbits', num: '09', title: 'Satellite orbits', domain: 'Orbital mechanics',
    blurb: 'Lower orbits fly faster; the geosynchronous orbit matches Earth\u2019s rotation.',
    notes: ['Depending on the purpose, satellites orbit the earth in different ways. A satellite may fly lower in altitude which means at higher speeds, or at higher altitudes resulting in lower speeds.', 'The geosynchronous (GEO) orbit is a unique orbit that actually matches the earth\u2019s rotation. GEO satellites appear to not move and provide constant coverage over one point on the earth.'],
    params: [{ key: 'alt', label: 'Altitude', min: 200, max: 35786, step: 1, def: 550, unit: ' km' }, { key: 'speed', label: 'Simulation speed', min: 1, max: 400, step: 1, def: 80, unit: ' min/s' }],
    video: 'https://www.youtube.com/watch?v=stUOQkc_clU', source: 'https://github.com/KyleKaminky/Orbits' },
  { id: 'keypad', num: '10', title: 'Keypad circuit', domain: 'Circuits',
    blurb: 'Row/column scanning — how a calculator or garage keypad knows which key you pressed.',
    notes: ['Have you ever wondered how a calculator or garage door keypad works? It probably uses a circuit similar to this one.', 'There is a voltage applied to each row at different times, and when a button is pressed it connects the circuit, which can be detected at each column. The pressed button is determined using the unique combination of row and column.'],
    params: [{ key: 'scan', label: 'Scan rate', min: 1, max: 20, step: 1, def: 4 }, { key: 'press', label: 'Key press interval', min: 1, max: 10, step: 1, def: 3 }],
    video: 'https://www.youtube.com/watch?v=B7dn_TpLaAY', source: 'https://github.com/KyleKaminky/KeypadCircuit' },
  { id: 'amfm', num: '11', title: 'AM / FM', domain: 'Communications',
    blurb: 'Amplitude modulation above, frequency modulation below, same message signal.',
    notes: ['Did you know the AM in AM Radio stands for amplitude modulation and the FM in FM Radio stands for frequency modulation?', 'AM takes a message signal and imprints that message on a carrier signal by changing the amplitude. FM does the same thing by changing the frequency of the carrier.'],
    params: [{ key: 'carrier', label: 'Carrier frequency', min: 6, max: 40, step: 1, def: 16 }, { key: 'depth', label: 'Modulation depth', min: 10, max: 100, step: 5, def: 70, unit: '%' }, { key: 'msg', label: 'Message frequency', min: 1, max: 6, step: 1, def: 2 }],
    video: 'https://www.youtube.com/watch?v=qxudTF2jjIU', source: 'https://github.com/KyleKaminky/AMFM' }
];

export const figById = (id) => FIGS.find((f) => f.id === id);
