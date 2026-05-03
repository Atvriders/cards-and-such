import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { PrimeFactorState, PrimeFactorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PrimeFactorGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PrimeFactorGame as unknown as React.ComponentType<unknown> })));
export const primeFactorSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
  questions: {
    kind: "enum" as const,
    label: "Questions",
    options: ["10", "20", "50"] as const,
    default: "10" as const,
  },
} as const;

type PrimeFactorSettingsType = SettingsOf<typeof primeFactorSettings>;

export const primeFactorPlugin: GamePlugin<PrimeFactorState, PrimeFactorAction, typeof primeFactorSettings> = {
  id: "prime-factor",
  title: "Prime Factor Race",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "A composite number appears — find its smallest prime factor as fast as possible.",
  howToPlay: `Prime Factor Race shows you a composite number and asks for its smallest prime factor — the smallest prime that divides evenly into it. Type the prime and press Enter.

A prime factor is a prime number that divides the target with no remainder. The smallest prime factor is always found by checking primes in order: 2, 3, 5, 7, 11, 13 ... The first one that divides the number exactly is the answer.

Quick-check rules to speed you up: A number is divisible by 2 if it is even (ends in 0, 2, 4, 6, or 8). It is divisible by 3 if its digits sum to a multiple of 3 — for 48, 4+8=12, divisible by 3, so 3 divides 48, but 2 divides it first since 48 is even. It is divisible by 5 if it ends in 0 or 5.

Easy difficulty presents composite numbers from 4 to 50. Medium extends the range to 200, requiring you to check primes up to 7 or 11. Hard goes up to 500, where you may need to test primes up to 23 before finding the factor.

Each correct answer scores 10 points. Wrong answers reveal the correct prime factor so you can study your mistake.

Tips: Always try 2 first (the fastest check). Then 3, then 5. These three primes cover a large fraction of composites. Only numbers that fail all three need you to try 7 and beyond.`,
  settings: primeFactorSettings,
  initialState: (seed: number, settings: PrimeFactorSettingsType) => initialState(seed, settings),
  reducer,
  isTerminal,
  hint: (state: PrimeFactorState): HintTarget | null => (state.phase === "playing" ? { selector: '[data-testid="hint-target-prime-factor-primary"]', pulses: 3 } : null),
  component: PrimeFactorGame,
};
