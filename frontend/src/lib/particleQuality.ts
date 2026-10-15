// Conservative device hints; the full archive never depends on the visual sample.
export function particleQuality(width: number) {
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const limited = (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
    || (memory !== undefined && memory <= 4);
  return { count: limited ? 600 : width < 760 ? 1000 : 2400, dpr: limited ? 1 : 1.25, fps: limited ? 30 : 60 };
}
