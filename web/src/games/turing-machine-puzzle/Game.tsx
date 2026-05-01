import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { TuringMachinePuzzleState, TuringMachinePuzzleAction, TuringMachinePuzzleSettings } from "./state.js";
import { TuringMachinePuzzle_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function TuringMachinePuzzleGame({ state, dispatch, onGameOver }: GameProps<TuringMachinePuzzleState, TuringMachinePuzzleSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="trm"
      cfg={TuringMachinePuzzle_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as TuringMachinePuzzleAction)}
      onSubmit={() => dispatch({ type: "submit" } as TuringMachinePuzzleAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, TuringMachinePuzzle_CFG)}
      intro={FLAVOR}
    />
  );
}
