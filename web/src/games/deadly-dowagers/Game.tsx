import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { DeadlyDowagersState, DeadlyDowagersAction, DeadlyDowagersSettings } from "./state.js";
import { DeadlyDowagers_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DeadlyDowagersGame({ state, dispatch, onGameOver }: GameProps<DeadlyDowagersState, DeadlyDowagersSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="ddw"
      cfg={DeadlyDowagers_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as DeadlyDowagersAction)}
      onSubmit={() => dispatch({ type: "submit" } as DeadlyDowagersAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, DeadlyDowagers_CFG)}
      intro={FLAVOR}
    />
  );
}
