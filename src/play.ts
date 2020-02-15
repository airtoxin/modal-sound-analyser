export const playAudioBuffer = async (
  ctx: AudioContext,
  audioBuffer: AudioBuffer,
  destinationNode: AudioNode = ctx.destination
): Promise<Uint8Array[]> => new Promise(resolve => {

  const analyser = ctx.createAnalyser();
  analyser.connect(ctx.destination);
  analyser.fftSize = 2048;

  const audioSource = ctx.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(analyser).connect(destinationNode);
  audioSource.start();

  const bufferLength = analyser.frequencyBinCount;
  const frequencies: Uint8Array[] = [];

  const pushFrequencyData = () => {
    rafId = requestAnimationFrame(pushFrequencyData);
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    frequencies.push(dataArray);
  };
  let rafId = requestAnimationFrame(pushFrequencyData);

  audioSource.addEventListener("ended", () => {
    cancelAnimationFrame(rafId);
    audioSource.disconnect();
    resolve(frequencies);
  });
});
