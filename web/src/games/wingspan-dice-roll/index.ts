import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { WingspanDiceRollState, WingspanDiceRollAction, WingspanDiceRollSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { WingspanDiceRollGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const wingspanDiceRollPlugin: GamePlugin<WingspanDiceRollState, WingspanDiceRollAction, typeof settings> = {
  id: "wingspan-dice-roll",
  title: "Wingspan: The Dice Game",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write bird scoring with habitat dice matching.",
  howToPlay: "Wingspan: The Dice Game is a roll-and-write bird-scoring game where habitat dice match bird requirements. In this adaptation you build an aviary on a 4x4 grid by rolling a single d6 each turn and assigning the value to a habitat cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip if the roll doesn't suit your bird strategy. Each marked habitat scores its dice value as bird points. Strategy: complete rows and columns to attract birds across habitat boundaries (+5 each), plus +10 for filling the aviary. Wingspan's classic theme rewards habitat specialisation; here line completion drives bonuses. Higher rolls attract premium birds, lower rolls fill out the habitat ranks. After 12 rolls the season ends. A solid Wingspan Dice score is 34-48 points; an exceptional ornithologist reaches 65+. Each game uses a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as WingspanDiceRollSettings),
  reducer,
  isTerminal,
  component: WingspanDiceRollGame,
};
