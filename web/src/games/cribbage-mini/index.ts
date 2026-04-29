import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CribbageMiniState, CribbageMiniAction, CribbageMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CribbageMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cribbageMiniPlugin: GamePlugin<CribbageMiniState, CribbageMiniAction, typeof settings> = {
  id: "cribbage-mini", title: "Cribbage Mini", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Cribbage: peg points by drawing higher than the CPU each round.",
  howToPlay: "Cribbage Mini is a stripped-down peg-counting variation of Cribbage focused on the head-to-head turn-up. Each round you and the CPU each cut a single card from a 52-card deck. The higher rank wins the peg. Aces count low (1) and Kings count high (13).\n\nScoring: a round win pegs 12 points (your \"his heels\" lump-sum). A tie still pegs you 4 sympathetic points so dead-even hands aren't useless. Lose the cut and you peg nothing for that round.\n\nThere are eight rounds total. Press Peg to draw both cards, see who pegged the higher card, then press Next to roll the cribbage board forward. Average expected score sits around 50-80 points; very lucky games can clear 110.\n\nThis is a quick taste of cribbage with no fifteens, pairs, runs, or his-nobs to track — just the cut, which traditionally decides the dealer in a real cribbage game. Use it to warm up before a real cribbage match.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CribbageMiniSettings),
  reducer, isTerminal, component: CribbageMiniGame,
};
