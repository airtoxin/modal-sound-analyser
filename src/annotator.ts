import unzip from "lodash/unzip";
import sortBy from "lodash/sortBy";
import countBy from "lodash/countBy";

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
  maxSampleValue: number
): FrequencyAnnotation[] => {
  return sortBy(
    annotatedFrequencies,
    x => -countBy(x.amplitudes, a => a > maxSampleValue / 2).true
  )
    .filter(x => x.frequency > 400)
    .slice(0, 20);
};
