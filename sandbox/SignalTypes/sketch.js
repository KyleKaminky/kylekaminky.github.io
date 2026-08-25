/*
                                Signal Types
                                ------------
   This sketch uses a randomly generated wave (thanks to Daniel Shiffman
   for the inspiration here, https://processing.org/examples/additivewave.html)
   to highlight the differences between an analog and digital signal, as well as,
   a continuous and discrete signal.

   p5.js port of SignalTypes.pde. Written in instance mode so that more than one
   sketch can live on the same page.
*/

// Global Constants
const CANVAS_SIZE = 1100;           // Drawing is done at this size, then scaled by CSS
const SAMPLE_PERIOD = 15;
const DISCRETE_CIRCLE_SIZE = 6;     // Size of the circle drawn at each discrete point
const MAX_WAVES = 9;                // total # of waves to add together
const GAP = 200;                    // Buffer on the side and top
const BG_COLOR = '#000000';
const TEXT_COLOR = '#FFFFFF';
const LABEL_FONT = 'Montserrat';    // Matches the blog. Loaded by index.html
const LABEL_SIZE = 25;
const LABEL_TRACKING = '3px';       // All-caps labels need a little air between letters
const X_SPACING = 0.5;              // How far apart should each horizontal location be spaced

function signalTypes(p) {

  // Global Variables
  let center_x, center_y, theta;
  let amplitude = new Array(MAX_WAVES);  // Height of wave
  let dx = new Array(MAX_WAVES);         // Value for incrementing X, calculated from period and xspacing
  let w;                                 // Width of entire wave
  let yvalues;                           // Using an array to store height values for the wave

  p.setup = function () {
    p.createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    p.pixelDensity(p.displayDensity());
    p.frameRate(50);

    center_x = p.width / 2;
    center_y = p.height / 2;
    theta = 0;

    w = p.width / 4 + 50;

    for (let i = 0; i < MAX_WAVES; i++) {
      amplitude[i] = p.random(-10, 40);
      let period = p.random(100, 600); // How many pixels before the wave repeats
      dx[i] = (p.TWO_PI / period) * X_SPACING;
    }

    yvalues = new Array(w * 2).fill(0);

    p.textFont(LABEL_FONT);
    p.stroke(TEXT_COLOR);
    p.fill(TEXT_COLOR);
  }; // End of setup()

  p.draw = function () {
    p.background(BG_COLOR);
    drawAxes();
    calcWave();
    renderWave();
  }; // End of draw()

  function calcWave() {
    // Increment theta (try different values for 'angular velocity' here
    theta += 0.02;

    // Set all height values to zero
    for (let i = 0; i < yvalues.length; i++) {
      yvalues[i] = 0;
    }

    // Accumulate wave height values
    for (let j = 0; j < MAX_WAVES; j++) {
      let x = theta;
      for (let i = 0; i < yvalues.length; i++) {
        // Every other wave is cosine instead of sine
        if (j % 2 === 0) yvalues[i] += p.sin(2 * x) * amplitude[j];
        else yvalues[i] += p.cos(2 * x) * amplitude[j];
        x += dx[j];
      }
    }
  } // End of calcWave()

  function renderWave() {
    p.ellipseMode(p.CENTER);
    for (let i = 1; i < yvalues.length; i++) {
      p.fill(TEXT_COLOR);

      let cont_x_previous = (i - 1) * X_SPACING + GAP;
      let cont_x = i * X_SPACING + GAP;
      let analog_y = p.height / 2 + yvalues[i] - (center_y - GAP) / 2;
      let digital_y_previous = p.height / 2 + Math.trunc(yvalues[i - 1] / 20) * 20 + (center_y - GAP) / 2;
      let digital_y = p.height / 2 + Math.trunc(yvalues[i] / 20) * 20 + (center_y - GAP) / 2;

      // Analog, Continuous
      p.ellipse(cont_x, analog_y, 3, 3);

      // Digital, Continuous
      p.line(cont_x_previous, digital_y_previous, cont_x, digital_y);

      // "Sample" the continuous signal
      if (i % SAMPLE_PERIOD === 0) {
        p.noFill();

        let discrete_x = i * X_SPACING + center_x + 15;
        let y_0 = center_y - (center_y - GAP) / 2;

        // Analog, Discrete Signal
        p.line(discrete_x, y_0, discrete_x, analog_y);
        p.ellipse(discrete_x, analog_y, DISCRETE_CIRCLE_SIZE, DISCRETE_CIRCLE_SIZE);

        // Set "0" for y on the digital signal
        y_0 = center_y + (center_y - GAP) / 2;

        // Digital, Discrete Signal
        p.line(discrete_x, y_0, discrete_x, digital_y);
        p.ellipse(discrete_x, digital_y, DISCRETE_CIRCLE_SIZE, DISCRETE_CIRCLE_SIZE);
      }
    }
  } // End of renderWave()

  function drawAxes() {
    // X, Y Axes Lines
    p.stroke(TEXT_COLOR);
    p.line(GAP, center_y, p.width - GAP, center_y);
    p.line(center_x, GAP, center_x, p.height - GAP);

    // Axes Labels
    p.fill(TEXT_COLOR);
    p.textSize(LABEL_SIZE);
    p.textAlign(p.CENTER, p.CENTER);

    // p5 has no letter-spacing of its own, so reach through to the 2D context.
    // Browsers that do not support it just draw the labels untracked.
    p.drawingContext.letterSpacing = LABEL_TRACKING;
    p.text('ANALOG', center_x, GAP - p.textAscent());
    p.text('DIGITAL', center_x, p.height - GAP + p.textAscent());
    p.textAlign(p.RIGHT, p.CENTER);
    p.text('CONTINUOUS', GAP - 15, center_y);
    p.textAlign(p.LEFT, p.CENTER);
    p.text('DISCRETE', p.width - GAP + 15, center_y);
  } // End of drawAxes()

} // End of signalTypes()
