import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { KnochelDiceState, KnochelDiceAction, KnochelDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { KnochelDiceGame } from "./Game.js";
const settings = { dummy: { kind:"boolean" as const, label:"dummy", default:false } } as const;
type S = SettingsOf<typeof settings>;
export const knochelDicePlugin: GamePlugin<KnochelDiceState, KnochelDiceAction, typeof settings> = {
  id: "knochel-dice",
  title: "Knochel Dice",
  category: "dice",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Historical European bone-dice gambling. Predict Bone, Cup, or Toss.",
  howToPlay: "Knochel descends from medieval European bone dice gambling. Two dice roll each round and you call one of three result tiers: Bone (any double — pairs are the bones of the score), Cup (sum equals exactly 7, the lucky cup roll), or Toss (anything else).\n\nBone covers 6 of 36 outcomes (16.7%) and pays 28. Cup covers 6 of 36 outcomes (16.7%) and pays 28. Toss covers 24 of 36 outcomes (66.7%) and pays 6. Expected value: Bone 4.7, Cup 4.7, Toss 4.0 — Bone and Cup are mathematically equivalent, with Toss as the lower-paying default.\n\nThe game runs 12 rounds. There are no rerolls. Average expected score lands near 75 points. Stacking Bone or Cup calls when you feel a streak coming spikes the score; staying on Toss caps you near 70 but rarely scores zero. Knochel rewards a mix of bold and patient calls, just as it did in dim European taverns centuries ago.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as KnochelDiceSettings),
  reducer,
  isTerminal,
  component: KnochelDiceGame,
};
