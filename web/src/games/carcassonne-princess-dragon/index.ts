import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CarcassonnePrincessDragonState, CarcassonnePrincessDragonAction, CarcassonnePrincessDragonSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CarcassonnePrincessDragonGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const carcassonnePrincessDragonPlugin: GamePlugin<CarcassonnePrincessDragonState, CarcassonnePrincessDragonAction, typeof settings> = {
  id: "carcassonne-princess-dragon",
  title: "Carcassonne: The Princess & The Dragon",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Princess, dragon, fairy, magic portal, and knight tile placement.",
  howToPlay: "Carcassonne: The Princess & The Dragon adds magical adversaries and protectors. In this adaptation you place 15 themed tiles on a 5x5 grid: princesses, dragons, fairies, magic portals, and knights. Click any empty cell to place the next queued tile. Each placement scores 1 base point plus 1 for each adjacent same-type tile. Princess tiles thematically remove knights, but in this scoring abstraction every adjacent same-type pair earns a bonus. Use the displayed tile type to plan whether to start a new cluster or extend an existing one. Dragons and fairies, being rarer feature types, often appear less frequently but can still chain into 2-3 tile groups for solid adjacency. The game ends after 15 placements with final adjacency scoring. Typical solo runs land between 25 and 40 points; a careful clusterer can break 45.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CarcassonnePrincessDragonSettings),
  reducer,
  isTerminal,
  component: CarcassonnePrincessDragonGame,
};
