import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CryptidDeductionState, CryptidDeductionAction, CryptidDeductionSettings } from "./state.js";
import { CryptidDeduction_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CryptidDeductionGame({ state, dispatch, onGameOver }: GameProps<CryptidDeductionState, CryptidDeductionSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="crd"
      cfg={CryptidDeduction_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CryptidDeductionAction)}
      onSubmit={() => dispatch({ type: "submit" } as CryptidDeductionAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CryptidDeduction_CFG)}
      intro={FLAVOR}
    />
  );
}
