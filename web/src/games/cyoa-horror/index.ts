import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { CyoaHorrorState, CyoaHorrorAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CyoaHorror } from "./Game.js";

export const cyoaHorrorPlugin = {
  id: "cyoa-horror",
  title: "Choose Your Path: Horror",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Survive a terrifying night at the haunted Ravenwood Manor through clever choices.",
  howToPlay: `Choose Your Path: Horror drops you into a suspenseful night at the infamous Ravenwood Manor. Your car has broken down, your phone is dead, and the only shelter is a manor known for ghostly hauntings.

At each scene you'll read what happens around you and choose your reaction. Your decisions branch the story in multiple directions — some paths lead to freedom, others to supernatural encounters, and a few to unexpected help from unlikely sources.

Survival scores range from 30 (thrown out by an angry ghost) to 100 (fully breaking the haunting). The best outcomes involve understanding the spirits and completing rituals to free them rather than simply hiding or fleeing.

Key tips: Reading the journal in the entrance hall gives you a solid plan. Talking to shadows instead of running from them can reveal allies. The east wing holds the key to the highest score — but only if you go in with the right information. Exploring carefully before acting is usually rewarded. There are 10 possible endings scattered across the many branches of the manor. Each playthrough takes 3-6 decisions.`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: CyoaHorrorState, action: CyoaHorrorAction) => CyoaHorrorState,
  isTerminal,
  component: CyoaHorror,
} as unknown as GamePlugin;
