import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { PalificoState, PalificoAction, PalificoSettings } from "./state.js";
import { Palifico_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PalificoGame({ state, dispatch, onGameOver }: GameProps<PalificoState, PalificoSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="plf"
      cfg={Palifico_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as PalificoAction)}
      onSubmit={() => dispatch({ type: "submit" } as PalificoAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Palifico_CFG)}
      intro={FLAVOR}
    />
  );
}
