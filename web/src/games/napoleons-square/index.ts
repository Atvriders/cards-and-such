import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonsSquareState, NapoleonsSquareAction, NapoleonsSquareSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonsSquareGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const napoleonsSquarePlugin: GamePlugin<NapoleonsSquareState, NapoleonsSquareAction, typeof settings> = {
  id: "napoleons-square",
  title: "Napoleon's Square",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Twelve-column, two-deck variant.",
  howToPlay: "Twelve-column, two-deck variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapoleonsSquareSettings),
  reducer,
  isTerminal,
  component: NapoleonsSquareGame,
};
