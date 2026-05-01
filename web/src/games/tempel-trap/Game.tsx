import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { TempelTrapState, TempelTrapAction, TempelTrapSettings } from "./state.js";
import { TempelTrap_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function TempelTrapGame({ state, dispatch, onGameOver }: GameProps<TempelTrapState, TempelTrapSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="tmtr"
      cfg={TempelTrap_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as TempelTrapAction)}
      onSubmit={() => dispatch({ type: "submit" } as TempelTrapAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, TempelTrap_CFG)}
      intro={FLAVOR}
    />
  );
}
