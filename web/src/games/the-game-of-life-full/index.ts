import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type {
  LifeFullState,
  LifeFullAction,
  LifeFullSettings,
} from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";

const TheGameOfLifeFullGame = /* @__PURE__ */ lazy(() =>
  import("./Game.js").then((mod) => ({
    default: mod.TheGameOfLifeFullGame as unknown as React.ComponentType<unknown>,
  })),
);

const settings = {
  startingCash: {
    kind: "number" as const,
    label: "Starting cash ($k)",
    min: 0,
    max: 200,
    step: 10,
    default: 10,
  },
} as const;
type S = SettingsOf<typeof settings>;

export const theGameOfLifeFullPlugin: GamePlugin<LifeFullState, LifeFullAction, typeof settings> = {
  id: "the-game-of-life-full",
  title: "The Game of Life (Full)",
  category: "board",
  players: { min: 2, max: 6, multiplayer: true },
  description: "Career or college? Marriage, kids, lawsuits, retirement — the full Milton Bradley spinner ride.",
  howToPlay: `The Game of Life (Full) is a head-to-head race through every milestone of an adult life. You play against a single CPU opponent on a 32-square board, taking turns spinning the wheel and resolving the square you land on.

START — CAREER OR COLLEGE?
Before your first spin you must choose:
— Career: pick from three normal-salary careers ($30k–$70k per payday), then start playing immediately.
— College: take a $100k debt and lose 4 turns sitting in class, but pick from three high-salary college careers ($70k–$100k per payday).
The CPU always picks Career (greedy AI).

THE BOARD
You advance 1-10 squares per spin. Squares trigger events:
— Payday: collect your salary.
— Marriage: spin again for a $50k or $100k wedding gift.
— Baby / Twins: +1 or +2 kids (small cost).
— Buy House: a house worth $80-200k is offered; buy it and add it to your net worth.
— Sell House: an offer rolls in ($80-220k); take it to cash out.
— Insurance (Auto / Home / Life): pay a one-time premium ($20-60k); reduces lawsuit damage by half.
— Spin to Win: pay $50k, spin — on 6-10 you win $200k.
— Lawsuit: pay $100k (or $50k with any insurance).
— Lottery / Expense: simple cash boosts and drains.
— Retirement: choose Millionaire Estates (+$200k if you have ≥$1000k cash, else $0) or Countryside Acres (+$100k guaranteed).

SCORING
Your final score = cash + house value + (kids × $10k) + (married? $20k) + (paydays × $5k) − debt + retirement bonus. You win if your final score beats the CPU.

CPU STRATEGY
The CPU always picks the highest-salary career card, always buys insurance, always buys offered houses, always sells houses for any offer, always plays Spin-to-Win, and picks Millionaire Estates only if cash+house ≥ $800k.

ADVANCED RULES OMITTED
This implementation skips Share-the-Wealth cards, mid-game career-swap squares, LIFE-tile collectibles, and multi-step lawsuit chains.`,
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LifeFullSettings),
  reducer,
  isTerminal,
  hint: (s: LifeFullState) => {
    if (isTerminal(s)) return null;
    if (s.active !== "human") return null;
    switch (s.phase) {
      case "choose-path":
        return { selector: '[data-testid="lifefull-choose-career"]', pulses: 3 };
      case "decision-career":
        return { selector: '[data-testid="lifefull-career-0"]', pulses: 3 };
      case "spinning":
        return { selector: '[data-testid="lifefull-spin"]', pulses: 3 };
      case "resolved":
        return { selector: '[data-testid="lifefull-next"]', pulses: 3 };
      case "decision-marry":
        return { selector: '[data-testid="lifefull-marry-spin"]', pulses: 3 };
      case "decision-house":
        return { selector: '[data-testid="lifefull-house-buy"]', pulses: 3 };
      case "decision-sell":
        return { selector: '[data-testid="lifefull-sell-yes"]', pulses: 3 };
      case "decision-insurance":
        return { selector: '[data-testid="lifefull-insurance-yes"]', pulses: 3 };
      case "decision-spin-win":
        return { selector: '[data-testid="lifefull-spinwin-play"]', pulses: 3 };
      case "decision-retire":
        return { selector: '[data-testid="lifefull-retire-countryside"]', pulses: 3 };
      default:
        return null;
    }
  },
  component: TheGameOfLifeFullGame,
};
