import waterDrop from "../static/Water-Drop.wav";
import { playAudioBuffer } from "./play";

document.addEventListener("DOMContentLoaded", async () => {
  const ctx = new AudioContext();

  const arrayBuffer = await fetch(waterDrop).then(res => res.arrayBuffer());
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const analyser = ctx.createAnalyser();
  analyser.connect(ctx.destination);
  analyser.fftSize = 2048;

  document.addEventListener("click", () => {
    playAudioBuffer(ctx, audioBuffer, analyser);
  });

  const drawWaveform = () => {
    requestAnimationFrame(drawWaveform);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    const canvasCtx = (document.getElementById(
      "waveform"
    ) as HTMLCanvasElement).getContext("2d")!;
    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, 1024, 100);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    canvasCtx.beginPath();

    const sliceWidth = (1024 * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * 100) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(1024, 100 / 2);
    canvasCtx.stroke();
  };

  const drawFrequency = () => {
    requestAnimationFrame(drawFrequency);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const canvasCtx = (document.getElementById(
      "frequency"
    ) as HTMLCanvasElement).getContext("2d")!;
    canvasCtx.fillStyle = "rgb(200, 200, 200)";
    canvasCtx.fillRect(0, 0, 1024, 100);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0, 0, 0)";
    canvasCtx.beginPath();

    const sliceWidth = (1024 * 1.0) / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = 100 - (v * 100) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(1024, 100 / 2);
    canvasCtx.stroke();
  };

  drawWaveform();
  drawFrequency();
});
