import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LabyrinthPatienceState, LabyrinthPatienceAction, LabyrinthPatienceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LabyrinthPatienceGame } from "./Game.js";

const settings = { _dummy: { kind: "boolean" as const, label: "_", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const labyrinthPatiencePlugin: GamePlugin<LabyrinthPatienceState, LabyrinthPatienceAction, typeof settings> = {
  id: "labyrinth-patience",
  title: "Labyrinth Patience",
  category: "solitaire",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Eight-column Labyrinth single-deck variant.",
  howToPlay: "Eight-column Labyrinth single-deck variant. Use drag-and-drop or click a card to auto-move it to the best legal destination. The Auto-move button finishes the foundations once the board is solved.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as LabyrinthPatienceSettings),
  reducer,
  isTerminal,
  component: LabyrinthPatienceGame,
};
