import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CodenamesXxlState, CodenamesXxlAction, CodenamesXxlSettings } from "./state.js";
import { CodenamesXxl_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CodenamesXxlGame({ state, dispatch, onGameOver }: GameProps<CodenamesXxlState, CodenamesXxlSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="cnxl"
      cfg={CodenamesXxl_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CodenamesXxlAction)}
      onSubmit={() => dispatch({ type: "submit" } as CodenamesXxlAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CodenamesXxl_CFG)}
      intro={FLAVOR}
    />
  );
}
