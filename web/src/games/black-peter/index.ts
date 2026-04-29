import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BlackPeterState, BlackPeterAction, BlackPeterSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BlackPeterGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const blackPeterPlugin: GamePlugin<BlackPeterState, BlackPeterAction, typeof settings> = {
  id: "black-peter", title: "Black Peter", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "German Old Maid variant where the unlucky card is the black Peter.",
  howToPlay: "Black Peter is the German variant of Old Maid played with a special deck containing matching pairs and a single odd card depicting Black Peter (a chimney-sweep figure). Players take turns drawing cards from each other's hand and discarding pairs. The player left holding the unmatched Black Peter at the end loses the round. In this simplified one-on-one CPU duel across six rounds, click Play Round to deal and simulate the random draw-and-discard sequence. Strategy: when offering your hand to the CPU to draw from, fan your cards so the Black Peter is not at the edge — psychology suggests opponents pick from the ends. When drawing, vary your selection patterns to avoid being read. Aim to avoid Black Peter in at least three of the six rounds for a respectable Black Peter score. A total above sixty points is a clean finish — survive the chimney sweep!",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BlackPeterSettings),
  reducer, isTerminal, component: BlackPeterGame,
};
