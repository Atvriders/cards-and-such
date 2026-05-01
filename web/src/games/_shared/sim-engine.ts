/**
 * Shared sim engine helpers: seeded dice rolls, common scoring patterns.
 * Used by sports sims and pub games to extract dice→outcome behavior.
 */
import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export function rollDie(rng: () => number, sides: number = 6): number {
  return 1 + Math.floor(rng() * sides);
}

export function rollDice(rng: () => number, count: number, sides: number = 6): number[] {
  const out: number[] = [];
  for (let i = 0; i < count; i++) out.push(rollDie(rng, sides));
  return out;
}

export function nextSeed(rng: () => number): number {
  return Math.floor(rng() * 2 ** 31);
}

/** Make a seeded RNG and a fresh seed for next state at once. */
export function rngFromSeed(seed: number): { rng: () => number; advance: () => number } {
  const rng = mulberry32(seed);
  return { rng, advance: () => nextSeed(rng) };
}

/** Roll `n` 6-sided dice, return sum. Useful for "pins knocked" patterns. */
export function rollSum(rng: () => number, count: number, sides: number = 6): number {
  let s = 0;
  for (let i = 0; i < count; i++) s += rollDie(rng, sides);
  return s;
}

/** Bowling-style scoring: 2d6 → pins for the frame (clamped 0..maxPins). */
export function bowlingFrame(rng: () => number, maxPins: number = 10): number {
  const r = rollDie(rng, 6) + rollDie(rng, 6); // 2..12
  // Map 2..12 onto 0..maxPins with mild bias.
  const v = Math.round(((r - 2) / 10) * maxPins);
  return Math.max(0, Math.min(maxPins, v));
}

/** Darts "shot": d20 area with miss chance. Returns { hit, multiplier }. */
export function dartShot(rng: () => number): { area: number; multiplier: 1 | 2 | 3; bull: boolean } {
  const roll = rollDie(rng, 20);
  const mult = rollDie(rng, 6); // 1..6 → 1=miss-ish, 2-4 single, 5 double, 6 triple
  const m: 1 | 2 | 3 = mult >= 6 ? 3 : mult >= 5 ? 2 : 1;
  if (roll === 20 && rollDie(rng, 4) === 1) return { area: 25, multiplier: 1, bull: true };
  return { area: roll, multiplier: m, bull: false };
}

/** Proximity throw for bocce/petanque/curling: lower distance is better. */
export function proximityThrow(rng: () => number, skill: number = 0): number {
  // skill 0..1, lower distance is better; result in 0..100
  const base = Math.floor(rng() * 100);
  return Math.max(0, Math.round(base * (1 - skill * 0.5)));
}

/** Baseball at-bat outcome from 2d6 + d20 lookup. */
export type BaseballOutcome = "K" | "BB" | "OUT" | "1B" | "2B" | "3B" | "HR";
export function baseballAtBat(rng: () => number, batterSkill: number = 0.5): BaseballOutcome {
  const r = rng();
  // basic distribution that scales with skill (0..1)
  const k = 0.18 - batterSkill * 0.05;
  const bb = k + 0.08;
  const out = bb + 0.45 - batterSkill * 0.05;
  const single = out + 0.13 + batterSkill * 0.04;
  const dbl = single + 0.07;
  const tpl = dbl + 0.02;
  if (r < k) return "K";
  if (r < bb) return "BB";
  if (r < out) return "OUT";
  if (r < single) return "1B";
  if (r < dbl) return "2B";
  if (r < tpl) return "3B";
  return "HR";
}

/** Race step: dice-based movement on a track. */
export function raceStep(rng: () => number, baseSpeed: number = 4): number {
  return Math.max(1, baseSpeed - 2 + rollDie(rng, 6));
}
