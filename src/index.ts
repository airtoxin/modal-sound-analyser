import waterDrop from "../static/Water-Drop.wav";
import { playAudioBuffer } from "./play";
import countBy from "lodash/countBy";
import { makeModalSynthesis } from "modal-synthesis";
import { annotateFrequency, extractModalSoundFrequency } from "./annotator";
import {
  clearCanvas,
  setupVisualizerContext,
  visualizeFrequency,
  visualizeModalSoundFrequency
} from "./visualizer";

const SAMPLING_RATE = 44100;
const MAX_SAMPLE_VALUE = 255;

const DRAWING_FREQUENCY_LIMIT = 10000;

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

const FFT_SIZE = Math.pow(2, 11);

document.addEventListener("DOMContentLoaded", async () => {
  const audioCtx = new AudioContext();
  const visualizerContext = setupVisualizerContext(
    "frequency",
    CANVAS_WIDTH,
    CANVAS_HEIGHT
  );

  const arrayBuffer = await fetch(waterDrop).then(res => res.arrayBuffer());
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const analyser = audioCtx.createAnalyser();
  analyser.connect(audioCtx.destination);
  analyser.fftSize = FFT_SIZE;

  document.addEventListener("click", async () => {
    const frequencyAmounts = await playAudioBuffer(
      audioCtx,
      audioBuffer,
      analyser
    );
    const annotatedFrequencies = annotateFrequency(
      frequencyAmounts,
      SAMPLING_RATE
    );

    clearCanvas(visualizerContext);

    // visualize frequency
    visualizeFrequency(
      visualizerContext,
      annotatedFrequencies,
      DRAWING_FREQUENCY_LIMIT
    );

    // draw discriminative frequency
    const modalSoundFrequencies = extractModalSoundFrequency(
      annotatedFrequencies
    );
    visualizeModalSoundFrequency(
      visualizerContext,
      modalSoundFrequencies,
      analyser.frequencyBinCount,
      DRAWING_FREQUENCY_LIMIT
    );

    // play modal sound
    const modalSound = makeModalSynthesis(
      modalSoundFrequencies.map(({ frequency, amplitudes }) => ({
        frequency: frequency,
        amplitude: Math.max(...amplitudes) / MAX_SAMPLE_VALUE,
        decay: countBy(amplitudes, a => a !== 0).true / amplitudes.length
      })),
      audioCtx
    ).makeModel({
      amplitudeMultiplier: 20
    });
    modalSound.outputNode.connect(audioCtx.destination);
    modalSound.excite();
  });
});
