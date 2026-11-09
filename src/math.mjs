export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// Reserve each peer's minimum first, then distribute the remaining mass
// proportionally to its previous share above that minimum.
export function redistribute(values, index, requested, minimum = 8) {
  const peers = values.map((_, i) => i).filter((i) => i !== index);
  const chosen = clamp(requested, minimum, 100 - peers.length * minimum);
  const excess = 100 - chosen - peers.length * minimum;
  const weights = peers.map((i) => Math.max(0, values[i] - minimum));
  const total = weights.reduce((a, b) => a + b, 0);
  const result = [...values];
  result[index] = chosen;
  peers.forEach((i, p) => {
    result[i] =
      minimum + excess * (total ? weights[p] / total : 1 / peers.length);
  });
  result[peers.at(-1)] += 100 - result.reduce((a, b) => a + b, 0);
  return result;
}
export function chartHeight(value, baseline, height = 270, top = 80) {
  return ((value - baseline) / (top - baseline)) * height;
}

// Largest-remainder rounding keeps the displayed tenths at exactly 100% too.
export function displayPercentages(values) {
  const units = values.map((v) => Math.floor(v * 10));
  const order = values
    .map((v, i) => ({ i, fraction: v * 10 - units[i] }))
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  const missing = 1000 - units.reduce((a, b) => a + b, 0);
  for (let n = 0; n < missing; n++) units[order[n % order.length].i]++;
  return units.map((v) => v / 10);
}
