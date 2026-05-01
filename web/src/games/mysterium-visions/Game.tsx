import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { MysteriumVisionsState, MysteriumVisionsAction, MysteriumVisionsSettings } from "./state.js";
import { MysteriumVisions_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MysteriumVisionsGame({ state, dispatch, onGameOver }: GameProps<MysteriumVisionsState, MysteriumVisionsSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="mysv"
      cfg={MysteriumVisions_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as MysteriumVisionsAction)}
      onSubmit={() => dispatch({ type: "submit" } as MysteriumVisionsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, MysteriumVisions_CFG)}
      intro={FLAVOR}
    />
  );
}
