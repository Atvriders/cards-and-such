import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { BountyHunterState, BountyHunterAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { BountyHunterGame } from "./Game.js";

export const bountyHunterPlugin = {
  id: "bounty-hunter",
  title: "Bounty Hunter",
  category: "arcade",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Hunt down 10 fugitives across the galaxy — pursue them for rewards or skip the dangerous ones!",
  howToPlay: `Bounty Hunter drops you into the boots of an interstellar bounty hunter. Over 10 rounds, a new fugitive target appears each round with a posted reward, an evasion rating, and a danger rating.

You have two choices each round: Pursue or Skip. Pursuing means heading after the target — if their evasion roll fails, you capture them and collect the bounty. But dangerous targets may injure you even on a successful capture. If you take enough damage, the hunt is over early.

Skipping a target is always safe but earns nothing. It can be wise to skip high-evasion, high-danger targets and wait for easier bounties worth less risk.

Targets get progressively tougher across the 10 rounds — later fugitives have higher evasion and danger ratings but also bigger bounties. Early rounds are a good time to build up credits before facing the most dangerous criminals.

Your health starts at 100. Injuries deal 15–35 damage. If health reaches zero, the game ends immediately regardless of remaining rounds. Your final score is based on total credits earned — aim for 700 or more for the highest rating!`,
  settings: {} as const,
  initialState: (seed: number) => initialState(seed),
  reducer: reducer as (state: BountyHunterState, action: BountyHunterAction) => BountyHunterState,
  isTerminal,
  component: BountyHunterGame,
} as unknown as GamePlugin;
