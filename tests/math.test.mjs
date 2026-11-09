import { test } from "node:test";
import assert from "node:assert/strict";
import { redistribute, chartHeight, displayPercentages } from "../src/math.mjs";
test("continuous reallocations preserve total, minimum, maximum and selected share", () => {
  let values = [35, 40, 25];
  for (let i = 0; i < 10000; i++) {
    const index = i % 3,
      requested = Math.sin(i * 47.17) * 130 + 50;
    values = redistribute(values, index, requested);
    assert.ok(Math.abs(values.reduce((a, b) => a + b, 0) - 100) < 1e-9);
    values.forEach((v) => assert.ok(v >= 8 - 1e-9 && v <= 84 + 1e-9));
    assert.ok(
      Math.abs(values[index] - Math.max(8, Math.min(84, requested))) < 1e-9,
    );
  }
});
test("peers retain proportional excess above minimum; fully saturated peers recover", () => {
  const r = redistribute([35, 40, 25], 0, 60);
  assert.ok(Math.abs((r[1] - 8) / (r[2] - 8) - 32 / 17) < 1e-9);
  assert.deepEqual(redistribute([84, 8, 8], 0, 50), [50, 25, 25]);
});
test("same 68/74 values have dramatically different length ratio on truncated axis", () => {
  assert.ok(Math.abs(chartHeight(74, 65) / chartHeight(68, 65) - 3) < 1e-9);
  assert.ok(Math.abs(chartHeight(74, 0) / chartHeight(68, 0) - 74 / 68) < 1e-9);
  assert.equal(chartHeight(80, 0), 270);
});

test("display rounding never makes visible percentages sum to 99 or 101", () => {
  let v = [35, 40, 25];
  for (let i = 0; i < 1000; i++) {
    v = redistribute(v, i % 3, 8 + Math.abs(Math.sin(i)) * 76);
    const displayed = displayPercentages(v);
    assert.ok(Math.abs(displayed.reduce((a, b) => a + b, 0) - 100) < 1e-9);
    displayed.forEach((x, j) => assert.ok(Math.abs(x - v[j]) < 0.101));
  }
});
