import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { ToguzKumalak92State, ToguzKumalak92Action, ToguzKumalak92Settings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ToguzKumalak92Game } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const toguzKumalak92Plugin: GamePlugin<ToguzKumalak92State, ToguzKumalak92Action, typeof settings> = {
  id: "toguz-kumalak-92",
  title: "Toguz Kumalak (Kazakh)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Central Asian 9-pit Mancala — placement abstraction.",
  howToPlay: "Toguz Kumalak (also Toguz Korgool) is the Central Asian Mancala played in Kazakhstan, Kyrgyzstan, and the surrounding steppe. The full game uses 18 pits (2 rows of 9) with strategic 'tuzdyk' permanent capture rules that distinguish it from other Mancala. This 5x5 placement adaptation simplifies the territorial claim. Across 15 turns you and a random CPU alternate placing pieces on empty cells. Click an empty cell. The CPU plays uniformly random. After fifteen moves the player with more pieces wins. Final scoreboard: 100 for a win, 25 for a tie. Kazakhstan made Toguz Kumalak a national sport in 2010; the country hosts world championships. The full game's 'tuzdyk' rule lets you mark an opponent's pit as permanently yours after capturing seeds from it — a strategic depth-charge that creates whole-game tension. The placement reduction keeps the territory feel without the seed-counting cognitive load. Toguz Kumalak masters compete at international Mancala tournaments.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as ToguzKumalak92Settings),
  reducer,
  isTerminal,
  component: ToguzKumalak92Game,
};
