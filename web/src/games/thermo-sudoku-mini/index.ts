import type { GamePlugin } from "../../platform/game-plugin/types.js";
import type { ThermoSudokuMiniState, ThermoSudokuMiniAction, ThermoSudokuMiniSettings } from "./state.js";
import { initialState, reducer, isTerminal } from "./state.js";
import { ThermoSudokuMiniGame } from "./Game.js";
const settings = { dummy: { kind: "boolean" as const, label: "dummy", default: false } } as const;
export const thermoSudokuMiniPlugin: GamePlugin<ThermoSudokuMiniState, ThermoSudokuMiniAction, typeof settings> = {
  id: "thermo-sudoku-mini",
  title: "Thermo Sudoku Mini",
  category: "board",
  players: { min: 1, max: 1, multiplayer: false },
  description: "Thermometers run through the grid; digits along a thermometer must strictly increase from the bulb end onward.",
  howToPlay: "Thermo Sudoku Mini turns a small Latin-square grid into a temperature reading. Snaking through some cells you'll see a thermometer: a bulb at one end and a tail at the other. The digits along the thermometer must strictly increase from bulb to tail — no equals, no backtracking.\n\nCombined with the usual row/column rules (each digit appears once per row and column), thermometers slash candidate sets fast. A bulb cannot hold the highest digit; the tail cannot hold the smallest. Long thermometers force the digits 1, 2, 3, 4 in exact order.\n\nEach puzzle highlights a target cell and gives four candidate digits. Apply both the row/column rule and the thermometer's increasing constraint. The correct value should be the only legal choice.\n\nSix puzzles per round; correct answers earn 100 points plus a 10-points-per-second time bonus. Speed and logic both pay off in Thermo Sudoku.",
  settings,
  initialState: (seed: number) => initialState(seed, { dummy: true } as ThermoSudokuMiniSettings),
  reducer,
  isTerminal,
  hint: (s: any) => { const p = (s as any).phase; if (p === "done" || p === "gameover" || p === "ended" || p === "finished" || (s as any).gameOver || (s as any).won || (s as any).complete || (s as any).isComplete) return null; return { selector: ".thermored-num", pulses: 3 }; },
  component: ThermoSudokuMiniGame,
};
