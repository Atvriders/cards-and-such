import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const skittlesLongAlleyPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "skittles-long-alley",
  title: "Skittles (Long Alley)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Full-length skittles alley; West Country variation.",
  howToPlay: "Skittles (Long Alley) plays the full-length 27-foot alley still found in Somerset, Devon, and Wiltshire pubs. Across twelve throws press Throw to launch a wooden cheese; a random outcome decides pins fallen 0-9. Long Alley scoring is harsher than table skittles: about 12% chance for a strike (9 pins), 22% chance for 7-8, 26% for 4-6, 25% for 1-3, and 15% complete miss. The CPU throws simultaneously each round. Total pins after twelve throws wins. Long Alley leagues remain hugely popular in the West Country; some alleys date to the 18th century. Strikes are celebrated with bell-ringing in some establishments. The longer alley demands more skill in real life; here the dice-distribution reflects that increased difficulty. Press Throw each round; pins fall and the scoreboard updates. Final scoreboard awards 100 points for the win, 25 for a tie. Long Alley skittles takes more turns than table skittles, providing a longer pub game suitable for relaxed evenings.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
