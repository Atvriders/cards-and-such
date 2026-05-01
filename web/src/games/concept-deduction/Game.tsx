import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ConceptDeductionState, ConceptDeductionAction, ConceptDeductionSettings } from "./state.js";
import { ConceptDeduction_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ConceptDeductionGame({ state, dispatch, onGameOver }: GameProps<ConceptDeductionState, ConceptDeductionSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="cnd"
      cfg={ConceptDeduction_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ConceptDeductionAction)}
      onSubmit={() => dispatch({ type: "submit" } as ConceptDeductionAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ConceptDeduction_CFG)}
      intro={FLAVOR}
    />
  );
}
