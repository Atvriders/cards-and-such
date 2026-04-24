import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import type { LogicGatesState, LogicGatesAction } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { LogicGatesGame } from "./Game.js";

const logicGatesSettings = {
  difficulty: {
    kind: "enum" as const,
    label: "Difficulty",
    options: ["easy", "medium", "hard"] as const,
    default: "easy" as const,
  },
} as const;

type S = SettingsOf<typeof logicGatesSettings>;

export const logicGatesSimPlugin: GamePlugin<LogicGatesState, LogicGatesAction, typeof logicGatesSettings> = {
  id: "logic-gates-sim",
  title: "Logic Gates",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Toggle input switches to route a signal through AND/OR/NOT gates and match the target output.",
  howToPlay: `Logic Gates presents a small digital circuit made of logic gates. Each gate takes one or two binary inputs (0 or 1) and produces a single binary output according to its type: AND outputs 1 only if both inputs are 1; OR outputs 1 if at least one input is 1; NOT flips its single input; NAND is the inverse of AND; NOR is the inverse of OR; XOR outputs 1 only if exactly one input is 1.

On the left are input switches labelled A, B, C... You can flip any switch between 0 and 1 by clicking it. Each gate in the circuit uses the current values of its inputs (which may come from other gates or directly from your switches). The final gate in the chain is the circuit output.

Your goal is to set the input switches so the circuit output matches the displayed target value.

Three difficulty levels: Easy has 2 inputs and 2 gates; Medium has 3 inputs and 3 gates; Hard has 4 inputs and 5 gates.

Score starts at 500 and decreases by 20 per toggle, floor 100. Think through gate logic before toggling to minimise wasted moves.

Tip: Work backward from the output gate. Ask what input combination makes that gate produce the target, then recursively satisfy each prior gate's requirements.`,
  settings: logicGatesSettings,
  initialState: (seed: number, settings: S) => initialState(seed, settings),
  reducer,
  isTerminal,
  component: LogicGatesGame,
};
