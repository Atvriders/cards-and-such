import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { MiniPokerSquareState, MiniPokerSquareAction, MiniPokerSquareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MiniPokerSquareGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const miniPokerSquarePlugin: GamePlugin<MiniPokerSquareState, MiniPokerSquareAction, typeof settings> = {
  id: "mini-poker-square",
  title: "Mini Poker Square",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Mini Poker Square — match pairs in a 4×4 grid by adjacency.",
  howToPlay: "Mini Poker Square — match pairs in a 4×4 grid by adjacency. Click a card, then click another that shares its rank. Pairs cancel; clear the board to win.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MiniPokerSquareSettings),
  reducer,
  isTerminal,
  component: MiniPokerSquareGame,
};
