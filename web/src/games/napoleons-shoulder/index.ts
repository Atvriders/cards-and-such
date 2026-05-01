import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { NapoleonsShoulderState, NapoleonsShoulderAction, NapoleonsShoulderSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { NapoleonsShoulderGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const napoleonsShoulderPlugin: GamePlugin<NapoleonsShoulderState, NapoleonsShoulderAction, typeof settings> = {
  id: "napoleons-shoulder",
  title: "Napoleon's Shoulder",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shoulder variant: nine columns of five face-up cards.",
  howToPlay: "Shoulder variant: nine columns of five face-up cards. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as NapoleonsShoulderSettings),
  reducer,
  isTerminal,
  component: NapoleonsShoulderGame,
};
