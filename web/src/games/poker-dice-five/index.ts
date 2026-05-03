import { lazy } from "react";
import type * as React from "react";
import type { GamePlugin, HintTarget } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { PokerDiceFiveState, PokerDiceFiveAction, PokerDiceFiveSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
const PokerDiceFiveGame = /* @__PURE__ */ lazy(() => import("./Game.js").then((mod) => ({ default: mod.PokerDiceFiveGame as unknown as React.ComponentType<unknown> })));
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const pokerDiceFivePlugin: GamePlugin<PokerDiceFiveState, PokerDiceFiveAction, typeof settings> = {
  id: "poker-dice-five",
  title: "Poker Dice Five",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Five dice rolled, score the best poker hand: pair, two pair, trips, etc.",
  howToPlay: "Poker Dice Five rolls five six-sided dice once per round and scores the best poker hand formed by the result. There are no rerolls — pure rolling and scoring across 10 rounds. Higher-ranking hands pay more and are rarer.\n\nThe scoring tiers: Five of a Kind = 100; Four of a Kind = 50; Full House = 30; Straight (1-2-3-4-5 or 2-3-4-5-6) = 25; Three of a Kind = 15; Two Pair = 10; One Pair = 5; High Card = 0.\n\nProbabilities: Five of a Kind = 6/7776 (0.08%); Four of a Kind = 150/7776 (1.9%); Full House = 300/7776 (3.9%); Straight = 240/7776 (3.1%); Three of a Kind = 1200/7776 (15.4%); Two Pair = 1800/7776 (23.1%); One Pair = 3600/7776 (46.3%); High Card = 480/7776 (6.2%).\n\nThe game scores automatically each round. Average expected score lands near 80 points. Five-dice poker probabilities favor pairs and triples, so most rounds land in the 5-15 point range, with occasional spikes from Full Houses or rare Five of a Kinds.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PokerDiceFiveSettings),
  reducer,
  isTerminal,
  hint: (state: PokerDiceFiveState): HintTarget | null => {
    if (state.phase === "done") return null;
    if (state.phase === "result") {
      return { selector: '[data-testid="hint-target-poker-dice-five-next"]', pulses: 3 };
    }
    return { selector: '[data-testid="hint-target-poker-dice-five-roll"]', pulses: 3 };
  },
  component: PokerDiceFiveGame,
};
