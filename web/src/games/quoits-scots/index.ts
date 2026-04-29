import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quoitsScotsPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "quoits-scots",
  title: "Quoits (Scots)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Longer pitch with heavier quoits; clay bed surrounds pin.",
  howToPlay: "Quoits (Scots) has you throw heavy 8-pound quoits at a longer pitch with a clay bed surrounding the iron pin. Across twelve throws press Toss; a random outcome decides where your quoit lands: ringer (8 points, harder than English), close to pin (1-2 points by distance band), bed-only (1 point if it sticks to clay), miss completely (0). About 6% chance for a ringer, 18% for close (2 pts), 25% for bed-stick (1 pt), 51% miss. The CPU tosses simultaneously each round. Total points after twelve throws wins. Scots quoits is the heavyweight cousin of English quoits, with longer pitches and more demanding throws. Surviving Scottish leagues are concentrated in Lanarkshire and Ayrshire; players hand-cast their own quoits from molten lead. The harder scoring rate here matches the real-life difficulty curve. Press Toss to advance; ringers are celebrated with an on-screen flourish. Final scoreboard awards 100 points for the win, 25 for a tie.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
