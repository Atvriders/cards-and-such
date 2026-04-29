import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { CatchDiceState, CatchDiceAction, CatchDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CatchDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const catchDicePlugin: GamePlugin<CatchDiceState, CatchDiceAction, typeof settings> = {
  id: "catch-dice",
  title: "Catch Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Catch the dice as they roll. Predict capture difficulty: Easy/Medium/Hard.",
  howToPlay: "Catch Dice is inspired by the dice-catch-in-cup tavern variant. Two dice roll each round and you predict the difficulty tier of catching the result mid-air: Easy (low sum 2-5 — the cup falls short), Medium (sum 6-9 — the typical mid-range catch), or Hard (sum 10-12 — high-flying dice that need a deft hand).\n\nEasy occurs on 10 of 36 outcomes (27.8%) and pays 18. Medium occurs on 20 of 36 (55.5%) and pays 9. Hard occurs on 6 of 36 (16.7%) and pays 30. Expected values: Easy 5.0, Medium 5.0, Hard 5.0 — perfectly balanced, so the choice is pure player preference and risk tolerance.\n\nThe game runs 12 rounds, no rerolls. Average expected score lands near 60 points. Catch Dice is a thinly veiled probability puzzle — the equal-EV structure forces you to commit based on streak intuition or the seed pattern. Calling Hard repeatedly is the high-variance line; calling Medium is the smooth-curve line; mixing tends to land between them.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CatchDiceSettings),
  reducer,
  isTerminal,
  component: CatchDiceGame,
};
