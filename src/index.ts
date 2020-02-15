import waterDrop from "../static/Water-Drop.wav";
import { playAudioBuffer } from "./play";
import unzip from "lodash/unzip";
import sortBy from "lodash/sortBy";
import sum from "lodash/sum";
import countBy from "lodash/countBy";
import { makeModalSynthesis } from "modal-synthesis";

const SAMPLING_RATE = 44100;
const MAX_SAMPLE_VALUE = 255;

const DRAWING_FREQUENCY_LIMIT = 10000;

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 500;

type FrequencyAnnotation = {
  frequency: number;
  amplitudes: number[];
};

const annotateFrequency = (
  frequencyAmounts: Uint8Array[]
): FrequencyAnnotation[] => {
  const numSamples = frequencyAmounts[0].length;
  return unzip(frequencyAmounts.map(u8a => [...u8a]))
    .map<FrequencyAnnotation>((amplitudes, i) => ({
      frequency: (i * SAMPLING_RATE) / numSamples,
      amplitudes
    }))
    .filter(x => x.frequency !== 0);
};

const extractModalSoundFrequency = (
  annotatedFrequencies: FrequencyAnnotation[]
): FrequencyAnnotation[] => {
  return sortBy(
    annotatedFrequencies,
    x => -countBy(x.amplitudes, a => a > MAX_SAMPLE_VALUE / 2).true
  )
    .filter(x => x.frequency > 400)
    .slice(0, 20);
};

document.addEventListener("DOMContentLoaded", async () => {
  const audioCtx = new AudioContext();
  const canvasCtx = (document.getElementById(
    "frequency"
  ) as HTMLCanvasElement).getContext("2d")!;

  canvasCtx.fillStyle = "rgb(200, 200, 200)";
  canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  canvasCtx.lineWidth = 1;
  canvasCtx.strokeStyle = "rgb(0, 0, 0)";

  const arrayBuffer = await fetch(waterDrop).then(res => res.arrayBuffer());
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const analyser = audioCtx.createAnalyser();
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 2048;

  document.addEventListener("click", async () => {
    const frequencyAmounts = await playAudioBuffer(
      audioCtx,
      audioBuffer,
      analyser
    );
    const annotatedFrequencies = annotateFrequency(frequencyAmounts);

    canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // visualize frequency
    const sortByFrequencies = sortBy(annotatedFrequencies, x => x.frequency);
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, 0);
    for (const { frequency, amplitudes } of sortByFrequencies) {
      if (frequency > DRAWING_FREQUENCY_LIMIT) continue;
      canvasCtx.lineTo(
        (frequency / DRAWING_FREQUENCY_LIMIT) * CANVAS_WIDTH,
        CANVAS_HEIGHT - sum(amplitudes) / amplitudes.length
      );
    }
    canvasCtx.stroke();

    // draw discriminative frequency
    const modalSoundFrequencies = extractModalSoundFrequency(
      annotatedFrequencies
    );
    for (const { frequency } of modalSoundFrequencies) {
      canvasCtx.beginPath();
      canvasCtx.moveTo(
        (frequency / DRAWING_FREQUENCY_LIMIT) * analyser.frequencyBinCount,
        0
      );
      canvasCtx.lineTo(
        (frequency / DRAWING_FREQUENCY_LIMIT) * analyser.frequencyBinCount,
        CANVAS_HEIGHT
      );
      canvasCtx.stroke();
    }

    const modalSound = makeModalSynthesis(
      modalSoundFrequencies.map(({ frequency, amplitudes }) => ({
        frequency: frequency,
        amplitude: Math.max(...amplitudes) / MAX_SAMPLE_VALUE,
        decay: countBy(amplitudes, a => a !== 0).true / amplitudes.length
      })),
      audioCtx
    ).makeModel({
      amplitudeMultiplier: 10
    });
    modalSound.outputNode.connect(audioCtx.destination);
    modalSound.excite();
  });
});
