import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { HatState, HatAction, HatSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { PrisonerHatGame } from "./Game.js";

const settings = {} as const;

export const prisonerHatPlugin: GamePlugin<HatState, HatAction, typeof settings> = {
  id: "prisoner-hat",
  title: "Prisoner Hat",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Classic logic brainteaser — prisoners must deduce their own hat color from what others say.",
  howToPlay: `Prisoner Hat puzzles are a family of famous logic brainteasers involving prisoners who can see each other's hats but not their own. Using only what they observe and what other prisoners say (or don't say), they must deduce the color of their own hat.

Each puzzle presents a scenario with a number of prisoners, a description of who can see whom, the hat distribution rules, and the actions taken by each prisoner in sequence. Your job is to reason from the available information to pick the correct answer.

Key logical principles to master: if a prisoner says they don't know, it reveals useful information — it means the visible hats did not create a logically forced answer for them. Each subsequent prisoner can use that silence as additional evidence.

Read the scenario carefully. Think about what a prisoner would say if they knew versus if they didn't. Trace the chain of deductions. Then select the answer you believe is correct and submit.

After revealing the answer, a full explanation walks through the logical chain. Study it carefully — these puzzles build on each other, with harder scenarios requiring multi-step reasoning.

Each correct answer earns 500 points. Work through as many as you like!`,
  settings,
  initialState: (seed: number, s: HatSettings) => initialState(seed, s),
  reducer,
  isTerminal,
  component: PrisonerHatGame,
};
