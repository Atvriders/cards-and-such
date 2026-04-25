import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { TextAdventureState, TextAdventureAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { TextAdventureMini } from "./Game.js";

export const textAdventureMiniPlugin = {
  id: "text-adventure-mini",
  title: "Text Adventure",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Navigate a branching text adventure through a mysterious forest and ancient ruins.",
  howToPlay: `Text Adventure is a classic choose-your-own-path narrative game set in a fantasy world. You begin at the edge of a dark forest and make choices that shape your journey.

Each scene presents you with a description of your surroundings and several choices. Click any choice to continue the story. Your decisions lead to wildly different outcomes — some paths take you to treasure vaults, sacred shrines, outlaw camps, or ancient spirits, while others end your adventure early.

There are over a dozen distinct scenes to discover across multiple playthroughs. Some choices earn bonus score points: answering riddles correctly or making clever decisions rewards extra points on top of the base outcome score.

Your final score depends on which ending you reach and any bonus points accumulated along the way. The best endings award 90-100 points. A quick retreat scores as low as 10. Experiment with different choices to discover all the paths — each playthrough takes only a few minutes.

Tips: Read carefully before choosing. Some options that seem risky can lead to great rewards. Peaceful or clever solutions often outperform violent ones. Look for riddles — they are always solvable and worth bonus points.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: TextAdventureState, action: TextAdventureAction) => TextAdventureState,
  isTerminal,
  component: TextAdventureMini,
} as unknown as GamePlugin;
