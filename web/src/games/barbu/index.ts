import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { BarbuState, BarbuAction, BarbuSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BarbuGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const barbuPlugin: GamePlugin<BarbuState, BarbuAction, typeof settings> = {
  id: "barbu", title: "Barbu", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Negative partnership contract sampler — seven mini-games per round.",
  howToPlay: "Barbu is a French four-player contract sampler card game where each player rotates through seven different negative-scoring contracts: no-tricks, no-hearts, no-queens, no-king-of-hearts, no-last-two-tricks, domino (a sequence-building game), and trump (declarer picks trump and aims for tricks). Each round you must avoid taking penalty cards or trick scoring, depending on the contract. In this simplified CPU duel across six rounds, each round simulates one randomly selected contract. Click Play Round to deal thirteen-card hands and play. Strategy: in no-hearts contracts dump high hearts when leading; in no-queens carefully discard queens before they are caught. The variety is the challenge — adapt your play to each contract type. Aim for at least three rounds with negative scores under twenty for a respectable Barbu result.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as BarbuSettings),
  reducer, isTerminal, component: BarbuGame,
};
