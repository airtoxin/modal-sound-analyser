import sortBy from "lodash/sortBy";
import sum from "lodash/sum";
import { FrequencyAnnotation } from "./annotator";

export type VisualizerContext = {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
};

export const setupVisualizerContext = (
  canvasId: string,
  canvasWidth: number,
  canvasHeight: number
): VisualizerContext => {
  const ctx = (document.getElementById(
    canvasId
  ) as HTMLCanvasElement).getContext("2d")!;
  const context: VisualizerContext = {
    ctx,
    canvasWidth,
    canvasHeight
  };

  clearCanvas(context);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgb(0, 0, 0)";

  return context;
};

export const clearCanvas = (context: VisualizerContext): void => {
  context.ctx.fillStyle = "rgb(200, 200, 200)";
  context.ctx.fillRect(0, 0, context.canvasWidth, context.canvasHeight);
};

export const visualizeFrequency = (
  context: VisualizerContext,
  annotatedFrequencies: readonly FrequencyAnnotation[],
  drawingFrequencyLimit: number = 10000
): void => {
  const sortByFrequencies = sortBy(annotatedFrequencies, x => x.frequency);
  context.ctx.beginPath();
  context.ctx.moveTo(0, 0);
  for (const { frequency, amplitudes } of sortByFrequencies) {
    if (frequency > drawingFrequencyLimit) continue;
    context.ctx.lineTo(
      (frequency / drawingFrequencyLimit) * context.canvasWidth,
      context.canvasHeight - sum(amplitudes) / amplitudes.length
    );
  }
  context.ctx.stroke();
};

export const visualizeModalSoundFrequency = (
  context: VisualizerContext,
  modalSoundFrequencies: FrequencyAnnotation[],
  numSamples: number,
  drawingFrequencyLimit: number = 10000
): void => {
  for (const { frequency } of modalSoundFrequencies) {
    context.ctx.beginPath();
    context.ctx.moveTo((frequency / drawingFrequencyLimit) * numSamples, 0);
    context.ctx.lineTo(
      (frequency / drawingFrequencyLimit) * numSamples,
      context.canvasHeight
    );
    context.ctx.stroke();
  }
};
