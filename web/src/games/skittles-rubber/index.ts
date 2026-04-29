import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesRubberPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "skittles-rubber",
  title: "Skittles (Rubber)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Indoor rubber-ball-on-string skittles around central pin.",
  howToPlay: "Skittles (Rubber) is the indoor table version where a rubber ball on a string swings around a central pin to knock down small skittles arranged in a circle. Across ten swings you press Swing and the ball arcs around the pin; a random outcome decides how many skittles fall: 0-7. The arc-swing rewards timing — about 15% chance of clearing all 7, 25% of 5-6, 30% of 3-4, 20% of 1-2, 10% miss. The CPU swings simultaneously each round. Total skittles knocked after ten rounds wins. Rubber skittles is a popular indoor game in British clubs and family pubs; smaller table-top sets are sold for home play. The mechanic here translates the swing-and-catch into a click-and-reveal. Press Swing each round; results appear immediately. Final scoreboard awards 100 points for the win, 25 for a tie. The variant has fewer pins than English alley-skittles but more rapid play, fitting into a few minutes of bar-time.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
