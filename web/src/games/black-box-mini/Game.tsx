import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { BlackBoxMiniState, BlackBoxMiniAction, BlackBoxMiniSettings } from "./state.js";
import { BlackBoxMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function BlackBoxMiniGame({ state, dispatch, onGameOver }: GameProps<BlackBoxMiniState, BlackBoxMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="bbx"
      cfg={BlackBoxMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as BlackBoxMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as BlackBoxMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, BlackBoxMini_CFG)}
      intro={FLAVOR}
    />
  );
}
