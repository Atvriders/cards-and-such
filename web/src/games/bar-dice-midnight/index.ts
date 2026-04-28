import type { GamePlugin, SettingsOf } from "../../platform/game-plugin/types.js";
import type { MidnightBarDiceState, MidnightBarDiceAction, MidnightBarDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { MidnightBarDiceGame } from "./Game.js";

const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;

export const midnightBarDicePlugin: GamePlugin<MidnightBarDiceState, MidnightBarDiceAction, typeof settings> = {
  id: "bar-dice-midnight",
  title: "Midnight Bar Dice",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Bar dice. Must roll 1 and 4; remaining dice score, highest wins.",
  howToPlay: "Midnight Bar Dice is a six-dice pub-bar dice game where you must lock a 1 (anchor) and a 4 (lantern) before the rest of the dice can score. In this simplified single-roll version, the engine simulates one full turn: it rolls and tries to assemble the 1-and-4 anchors, then scores the remaining four dice. Each turn you press Roll and the simulation produces a score from 0 (couldn't anchor) to 20 (perfect roll). The distribution favors moderate scores, true bullseyes (perfect 1+4 then four high values) happen about 5% of the time. After each roll, press Next to advance. Score equals total points across ten turns. Average totals are 60-90. Great totals exceed 130. Like all pub-bar dice games, success is mostly luck, but the rhythm of roll-and-reveal carries the same satisfying tension as a real bar table.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as MidnightBarDiceSettings),
  reducer,
  isTerminal,
  component: MidnightBarDiceGame,
};
