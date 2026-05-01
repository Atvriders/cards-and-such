import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ClueMasterDetectiveState, ClueMasterDetectiveAction, ClueMasterDetectiveSettings } from "./state.js";
import { ClueMasterDetective_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ClueMasterDetectiveGame({ state, dispatch, onGameOver }: GameProps<ClueMasterDetectiveState, ClueMasterDetectiveSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="cmd"
      cfg={ClueMasterDetective_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ClueMasterDetectiveAction)}
      onSubmit={() => dispatch({ type: "submit" } as ClueMasterDetectiveAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ClueMasterDetective_CFG)}
      intro={FLAVOR}
    />
  );
}
