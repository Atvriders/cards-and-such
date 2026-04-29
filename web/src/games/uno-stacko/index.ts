import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { UnoStackoState, UnoStackoAction, UnoStackoSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { UnoStackoGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
type S = SettingsOf<typeof settings>;
export const unoStackoPlugin: GamePlugin<UnoStackoState, UnoStackoAction, typeof settings> = {
  id: "uno-stacko", title: "Uno-Stacko Shedding", category: "cards",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Shedding with skip/reverse/stacking action chains.",
  howToPlay: "Uno-Stacko Shedding is a variant of the Uno shedding family where action cards stack: a Draw 2 played onto the previous Draw 2 forces the next player to draw four; a Wild Draw 4 stacks onto Draw 2 for six; and reverse-and-skip combos can chain. Each player races to empty their seven-card hand by matching color, number, or special card. In this one-on-one CPU duel across six rounds, click Play Round to simulate the shedding race with stacking penalty cards. Strategy: hold your Draw 4 wildcard for late-round disasters when the CPU is one card from going out. Stack Draw 2s when possible — three stacked twos force a six-card draw and usually concede the round to you. Going out scores twenty points plus the value of CPU's remaining hand. Aim for at least three round wins and a total above one hundred for a strong stacking finish.",
  settings,
  initialState: (seed: number, s: S) => initialState(seed, s as UnoStackoSettings),
  reducer, isTerminal, component: UnoStackoGame,
};
