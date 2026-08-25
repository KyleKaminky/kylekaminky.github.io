/*
                              Satellite Orbits
                              ----------------
   Ported from Orbits.pde. Depending on their purpose, satellites orbit the
   Earth in different ways: lower orbits fly faster, higher orbits slower, and
   the geosynchronous orbit is the one whose period matches the Earth's own
   rotation, so the satellite appears to hang still over one spot.

   The original ran in P3D with a textured globe and four fixed orbits whose
   speeds were hand-tuned constants (268, 36, 18 deg/sec — calculateVelocity()
   was written but left commented out with a placeholder mu of 1). Here there is
   one orbit and the altitude slider drives it through real physics instead:

     T = 2*pi * sqrt(r^3 / mu)        orbital period, seconds
     v = sqrt(mu / r)                 orbital speed, km/s

   with r measured from the centre of the Earth and mu = 398600 km^3/s^2. That
   is what makes the lesson land: drag the slider to 35,786 km and the period
   comes out at the sidereal day on its own, and the satellite locks to the
   Earth's rotation marker because the arithmetic says it must — not because
   anything was tuned to make it look that way.

   Drawn looking down on the equatorial plane. Radii on screen are eased rather
   than to scale: at true scale LEO would sit inside the coastline of the Earth
   disc. Times and speeds are exact; only the radius is a lie, and it is the
   same lie every atlas tells.
*/

import {
  labelStyle, clearTracking, dashed, labelSizeFor, traceWeightFor, markerSizeFor, isDetailed,
} from './lib.js';

// Physical constants
const MU = 398600;          // Earth's gravitational parameter, km^3/s^2
const R_EARTH = 6371;       // km
const GEO_ALT = 35786;      // km — the altitude whose period is one sidereal day
const MEO_ALT = 20200;      // km — where GPS flies
const SIDEREAL_DAY = 86164; // s — one rotation of the Earth against the stars

// Drawing
const EARTH_RATIO = R_EARTH / (R_EARTH + GEO_ALT); // 0.151 — true, and kept true
const RADIUS_EASE = 0.55;   // pow() easing so LEO stays clear of the surface
const MERIDIANS = 6;
const MAX_STEP_MS = 100;    // clamp after the sketch has been paused offscreen

/* Kepler's third law. Seconds. */
function orbitPeriod(altKm) {
  const r = R_EARTH + altKm;
  return 2 * Math.PI * Math.sqrt((r * r * r) / MU);
}

/* Circular orbital speed. km/s. */
function orbitSpeed(altKm) {
  return Math.sqrt(MU / (R_EARTH + altKm));
}

/* The regimes the original sketch named, with the examples from its table. */
function regimeOf(altKm) {
  if (altKm < 2000) return ['LEO', 'Starlink'];
  if (altKm < 35000) return ['MEO', 'GPS'];
  return ['GEO', 'DirecTV'];
}

function formatPeriod(seconds) {
  const minutes = seconds / 60;
  // Above three hours, minutes stop being a useful unit to read.
  return minutes > 180 ? `${(minutes / 60).toFixed(2)} h` : `${minutes.toFixed(1)} min`;
}

export default function orbits({ get, palette, height, container }) {
  return (p) => {
    let earthAngle = 0;
    let satAngle = 0;

    let cx, cy, geoR, earthR, size, weight, marker, detailed;

    function layout() {
      cx = p.width / 2;
      cy = p.height / 2;
      geoR = Math.min(p.width, p.height) * 0.42;
      earthR = geoR * EARTH_RATIO;
      size = labelSizeFor(p.height);
      weight = traceWeightFor(p.height);
      marker = markerSizeFor(p.height);
      detailed = isDetailed(p.height);
    }

    /*
       Altitude to screen radius. Eased, because the interesting altitudes are
       all crowded near the bottom of the range: linearly, a 550 km orbit sits
       1.5% of the way to GEO and is indistinguishable from the surface.
    */
    function screenRadius(altKm) {
      const eased = Math.pow(p.constrain(altKm / GEO_ALT, 0, 1), RADIUS_EASE);
      return earthR + eased * (geoR - earthR);
    }

    p.setup = function () {
      p.createCanvas(container.clientWidth, height);
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.frameRate(60);
      p.ellipseMode(p.CENTER);
      layout();
      p.describe(
        'A satellite orbiting the Earth seen from above the equator, with ' +
        'reference rings for the medium and geosynchronous orbits, and readouts ' +
        'for altitude, orbital period and speed.'
      );
    };

    p.windowResized = function () {
      p.resizeCanvas(container.clientWidth, height);
      layout();
    };

    p.draw = function () {
      const alt = p.constrain(get('alt'), 0, GEO_ALT);
      const period = orbitPeriod(alt);

      // The slider is in simulated minutes per real second. At the default 80,
      // the Earth turns once every 18 seconds and a 550 km orbit takes 1.2 — so
      // "lower is faster" is visible immediately, and at GEO the two lock.
      const simSeconds = Math.min(p.deltaTime, MAX_STEP_MS) / 1000 * get('speed') * 60;
      earthAngle += (p.TWO_PI * simSeconds) / SIDEREAL_DAY;
      satAngle += (p.TWO_PI * simSeconds) / period;

      p.background(palette.bg);
      drawReferenceRings();
      drawEarth();
      drawSatellite(alt);
      if (detailed) drawReadouts(alt, period);
    };

    function drawReferenceRings() {
      p.noFill();
      p.stroke(palette.grid);
      p.strokeWeight(1);
      dashed(p, [2, 6], () => {
        p.circle(cx, cy, screenRadius(MEO_ALT) * 2);
        p.circle(cx, cy, geoR * 2);
      });

      if (!detailed) return;
      p.noStroke();
      p.fill(palette.grid);
      labelStyle(p, size - 1);
      p.textAlign(p.CENTER, p.BOTTOM);
      p.text('MEO', cx, cy - screenRadius(MEO_ALT) - 4);
      p.text('GEO', cx, cy - geoR - 4);
      clearTracking(p);
    }

    function drawEarth() {
      p.fill(palette.ghost);
      p.stroke(palette.faint);
      p.strokeWeight(1);
      p.circle(cx, cy, earthR * 2);

      p.push();
      p.translate(cx, cy);
      p.rotate(earthAngle);

      // Meridians, so the rotation is visible rather than implied
      p.stroke(palette.ghost);
      for (let i = 0; i < MERIDIANS; i++) {
        const a = (i * p.PI) / MERIDIANS;
        p.line(-earthR * Math.cos(a), -earthR * Math.sin(a), earthR * Math.cos(a), earthR * Math.sin(a));
      }

      // The reference meridian — the thing the satellite is compared against
      p.stroke(palette.faint);
      p.strokeWeight(weight);
      p.line(0, 0, earthR * 1.12, 0);
      p.noStroke();
      p.fill(palette.faint);
      p.circle(earthR * 1.12, 0, marker * 0.5);
      p.pop();
    }

    function drawSatellite(alt) {
      const r = screenRadius(alt);
      const x = cx + r * Math.cos(satAngle);
      const y = cy + r * Math.sin(satAngle);

      // The orbit itself
      p.noFill();
      p.stroke(palette.accent);
      p.strokeWeight(weight);
      p.circle(cx, cy, r * 2);

      // Radius line, to be read against the Earth's reference meridian. At GEO
      // these two hold a constant angle, which is the whole point of the figure.
      p.strokeWeight(1);
      dashed(p, [3, 5], () => p.line(cx, cy, x, y));

      p.noStroke();
      p.fill(palette.accent);
      p.circle(x, y, marker);
    }

    function drawReadouts(alt, period) {
      const [regime, example] = regimeOf(alt);
      const rows = [
        ['ALTITUDE', `${Math.round(alt).toLocaleString('en-US')} km`],
        ['PERIOD', formatPeriod(period)],
        ['SPEED', `${orbitSpeed(alt).toFixed(3)} km/s`],
        ['ORBIT', `${regime} · ${example}`],
      ];

      const pad = Math.round(p.width * 0.035);
      const colW = Math.min(230, p.width * 0.34);
      const lineH = size * 1.9;

      labelStyle(p, size);
      p.noStroke();
      rows.forEach(([label, value], i) => {
        const y = pad + i * lineH;
        p.fill(palette.faint);
        p.textAlign(p.LEFT, p.TOP);
        p.text(label, pad, y);
        p.fill(palette.ink);
        p.textAlign(p.RIGHT, p.TOP);
        p.text(value, pad + colW, y);
      });
      clearTracking(p);
    }
  };
}
