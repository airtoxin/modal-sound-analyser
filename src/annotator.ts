import unzip from "lodash/unzip";
import sortBy from "lodash/sortBy";

export type FrequencyAnnotation = {
  frequency: number;
  amplitudes: number[];
};

export const annotateFrequency = (
  frequencyAmounts: readonly Uint8Array[],
  samplingRate: number
): FrequencyAnnotation[] => {
  const numSamples = frequencyAmounts[0].length;
  return unzip(frequencyAmounts.map(u8a => [...u8a]))
    .map<FrequencyAnnotation>((amplitudes, i) => ({
      frequency: (i * samplingRate) / numSamples,
      amplitudes
    }))
    .filter(x => x.frequency !== 0);
};

export const extractModalSoundFrequency = (
  annotatedFrequencies: readonly FrequencyAnnotation[],
  minFrequencyDistance: number = 100
): FrequencyAnnotation[] => {
  const discriminativeFrequencies = sortBy(
    annotatedFrequencies,
    x => -Math.max(...x.amplitudes)
  )
    .filter(x => x.frequency > 30 && x.amplitudes.some(a => a !== 0))
    .slice(0, 100);

  const modalSoundFrequencies: FrequencyAnnotation[] = [];
  for (const discriminativeFrequency of discriminativeFrequencies) {
    if (
      modalSoundFrequencies.some(
        msf =>
          Math.abs(msf.frequency - discriminativeFrequency.frequency) <=
          minFrequencyDistance
      )
    ) {
      continue;
    }
    modalSoundFrequencies.push(discriminativeFrequency);
    if (modalSoundFrequencies.length >= 30) break;
  }

  return modalSoundFrequencies;
};
