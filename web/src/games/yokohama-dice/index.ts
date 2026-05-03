import type { GamePlugin, SettingsOf, HintTarget } from "../../platform/game-plugin/types.js";
import type { YokohamaDiceState, YokohamaDiceAction, YokohamaDiceSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { YokohamaDiceGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const yokohamaDicePlugin: GamePlugin<YokohamaDiceState, YokohamaDiceAction, typeof settings> = {
  id: "yokohama-dice",
  title: "Yokohama Diceventures",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Roll-and-write port city trading with district bonus actions.",
  howToPlay: "Yokohama Diceventures is a roll-and-write port-city trading game where districts trigger bonus actions. In this adaptation you build a Yokohama trading network on a 4x4 grid by rolling a single d6 each turn and assigning the value to a district cell. Click Roll, then click any empty cell to mark it with the rolled number. You may Skip a roll if it doesn't help. Each marked district scores its dice value as trade revenue. Strategy: complete rows and columns to activate district bonuses (+5 each) and earn the +10 full-port bonus. The trading theme in classic play involves chained district-by-district movement; here adjacency completion drives bonuses. Higher rolls boost trade revenue, lower rolls finish partial lines. After 12 rolls the trading season ends. A solid Yokohama score is 34-48 points; an exceptional trader reaches 65+. Each session begins with a fresh seeded dice sequence.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as YokohamaDiceSettings),
  reducer,
  isTerminal,
  hint: (state: YokohamaDiceState): HintTarget | null => {
    if (isTerminal(state)) return null;
    if (state.phase === "rolling") return { selector: '[data-testid="hint-target-yokohama-dice-roll"]', pulses: 3 };
    if (state.phase === "marking") return { selector: '[data-testid="hint-target-yokohama-dice-skip"]', pulses: 3 };
    return null;
  },
  component: YokohamaDiceGame,
};
