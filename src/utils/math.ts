export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const round1 = (value: number) => Number(value.toFixed(1));
export const round2 = (value: number) => Number(value.toFixed(2));

export const average = (values: number[]) =>
  values.reduce((sum, v) => sum + v, 0) / Math.max(values.length, 1);
