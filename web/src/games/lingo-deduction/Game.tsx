import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { LingoDeductionState, LingoDeductionAction, LingoDeductionSettings } from "./state.js";
import { LingoDeduction_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LingoDeductionGame({ state, dispatch, onGameOver }: GameProps<LingoDeductionState, LingoDeductionSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="lng"
      cfg={LingoDeduction_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as LingoDeductionAction)}
      onSubmit={() => dispatch({ type: "submit" } as LingoDeductionAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, LingoDeduction_CFG)}
      intro={FLAVOR}
    />
  );
}
