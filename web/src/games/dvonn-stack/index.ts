import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { DvonnStackState, DvonnStackAction, DvonnStackSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { DvonnStackGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const dvonnStackPlugin: GamePlugin<DvonnStackState, DvonnStackAction, typeof settings> = {
  id: "dvonn-stack",
  title: "Dvonn Stack",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Project Gipf stacking-stones abstract — placement adaptation.",
  howToPlay: "Dvonn is the second game in Kris Burm's Project Gipf series — a stacking-stones abstract where you build towers and try to disconnect opposing groups from the red 'Dvonn' anchor stones. The full game uses a 49-cell hexagonal board with a setup phase placing 23 white, 23 black, and 3 red stones, then movement and stacking. This 5x5 placement adaptation captures the territorial setup phase. Across 14 turns you and a random CPU alternate placing pieces on empty squares. Click an empty cell. The CPU plays uniformly random. After fourteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Dvonn won the 2002 Mensa Select award; many abstract enthusiasts rank it the deepest of the Gipf project. The full stacking and disconnection rules require detailed simulation; the placement reduction captures only the 'who claims more squares' essence. Burm designed Dvonn after the success of his 1997 Gipf opener.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as DvonnStackSettings),
  reducer,
  isTerminal,
  component: DvonnStackGame,
};
