import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CyoaFantasyState, CyoaFantasyAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CyoaFantasy } from "./Game.js";

export const cyoaFantasyPlugin = {
  id: "cyoa-fantasy",
  title: "Choose Your Path: Fantasy",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Lead a hero on an epic quest to claim the Sunstone and defeat the Shadow King.",
  howToPlay: `Choose Your Path: Fantasy is a branching narrative adventure where your decisions determine the fate of the realm. You play as a hero summoned to defeat the Shadow King and recover the legendary Sunstone.

At each scene, you'll read a description of your situation and choose from two or three options. Each choice leads to a different branch of the story — some paths are longer and more rewarding, others end quickly. There is no wrong path, but some routes earn more points than others.

Points come from your ending result plus any bonus points earned along the way. Answering riddles correctly, making honorable choices, and finding the Sunstone before facing the final villain all award bonus points. The perfect run — finding the Sunstone then defeating the Shadow King empowered — scores 100 points.

Explore multiple times to discover all branches. Key decision points: whether to hire help or go alone, which route to take through the mountains, and whether to search for the Sunstone before the final confrontation. The story has 7 possible endings ranging from 40 to 100 points. Each playthrough takes 5-8 clicks to complete.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CyoaFantasyState, action: CyoaFantasyAction) => CyoaFantasyState,
  isTerminal,
  component: CyoaFantasy,
} as unknown as GamePlugin;
