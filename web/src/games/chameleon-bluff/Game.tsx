import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ChameleonBluffState, ChameleonBluffAction, ChameleonBluffSettings } from "./state.js";
import { ChameleonBluff_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ChameleonBluffGame({ state, dispatch, onGameOver }: GameProps<ChameleonBluffState, ChameleonBluffSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="chb"
      cfg={ChameleonBluff_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ChameleonBluffAction)}
      onSubmit={() => dispatch({ type: "submit" } as ChameleonBluffAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ChameleonBluff_CFG)}
      intro={FLAVOR}
    />
  );
}
