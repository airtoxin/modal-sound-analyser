export const playAudioBuffer = (
  ctx: AudioContext,
  audioBuffer: AudioBuffer,
  destinationNode: AudioNode = ctx.destination
): void => {
  const audioSource = ctx.createBufferSource();
  audioSource.buffer = audioBuffer;
  audioSource.connect(destinationNode);
  audioSource.start();

  audioSource.addEventListener("ended", audioSource.disconnect);
};
