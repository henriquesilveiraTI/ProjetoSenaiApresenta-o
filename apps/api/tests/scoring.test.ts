import { describe, expect, it } from "vitest";
import { calculatePoints } from "../src/game/scoring.js";

describe("calculatePoints", () => {
  it("não pontua respostas erradas", () => {
    expect(calculatePoints(false, 1000, 5)).toBe(0);
  });

  it("pontua resposta correta rápida", () => {
    expect(calculatePoints(true, 800, 1)).toBe(140);
  });

  it("reduz o bônus de velocidade com o tempo", () => {
    const fast = calculatePoints(true, 1000, 1);
    const slow = calculatePoints(true, 10_000, 1);
    expect(fast).toBeGreaterThan(slow);
    expect(slow).toBe(100);
  });

  it("aplica bônus de sequência com limite", () => {
    expect(calculatePoints(true, 1000, 2)).toBe(161);
    expect(calculatePoints(true, 1000, 4)).toBe(211);
    expect(calculatePoints(true, 1000, 10)).toBe(211);
  });
});
