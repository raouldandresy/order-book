export const PRECISIONS = ['P0', 'P1', 'P2', 'P3'] as const;
export type Precision = typeof PRECISIONS[number];
