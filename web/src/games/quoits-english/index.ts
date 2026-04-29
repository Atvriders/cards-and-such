import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { PubState, PubAction, PubSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PubGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const quoitsEnglishPlugin: GamePlugin<PubState, PubAction, typeof settings> = {
  id: "quoits-english",
  title: "Quoits (English)",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Ring-throw at iron hob; closest ring scores.",
  howToPlay: "Quoits (English) has you throw a metal ring at a fixed iron hob across a pub yard. Across twelve throws press Toss; a random outcome decides where your ring lands: ringer (ring around the hob, 6 points), close (1 point), distant (0 points), or knocking off the CPU's ring (gain 2). About 12% chance for a ringer, 35% for close, 50% distant, 3% knock-off. The CPU tosses simultaneously each round. Total points after twelve throws wins. English quoits is one of the oldest pub games, dating to medieval village greens. Modern leagues in the North of England play to specific rules with regional variations. The metal ring weighs 2-4 pounds in real life; here we represent the result probabilistically. Press Toss to advance each round; ringers are dramatically announced. Final scoreboard awards 100 points for the win, 25 for a tie. The English version uses lighter rings than Scots quoits, on a shorter pitch, with a corresponding higher rate of ringer scoring.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as PubSettings),
  reducer,
  isTerminal,
  component: PubGame,
};
