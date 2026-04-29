import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { CleverHochVierState, CleverHochVierAction, CleverHochVierSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { CleverHochVierGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const cleverHochVierPlugin: GamePlugin<CleverHochVierState, CleverHochVierAction, typeof settings> = {
  id: "clever-hoch-vier",
  title: "Clever hoch Vier",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Fourth GSC instalment with new colour combinations and token powers.",
  howToPlay: "Clever hoch Vier is the fourth Ganz Schön Clever instalment with new colour combinations and token powers. In this adaptation you fill a 4x4 multi-colour score sheet by rolling a single d6 each turn and assigning the value to a cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't fit. Each marked cell scores its value. Strategy: complete rows and columns to trigger token powers (+5 each), plus a +10 full-sheet bonus. The colour-combination theme in classic play creates chained scoring; here line-completion drives bonuses. Higher dice values are premium marks, lower ones finish partial lines. After 12 rolls the sheet finalises. A solid Clever hoch Vier score is 34-48 points; chain-completers reach 65+. Each session begins with a fresh seeded dice sequence to keep every game uniquely puzzling.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as CleverHochVierSettings),
  reducer,
  isTerminal,
  component: CleverHochVierGame,
};
