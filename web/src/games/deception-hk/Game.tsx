import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { DeceptionHkState, DeceptionHkAction, DeceptionHkSettings } from "./state.js";
import { DeceptionHk_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DeceptionHkGame({ state, dispatch, onGameOver }: GameProps<DeceptionHkState, DeceptionHkSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="dhk"
      cfg={DeceptionHk_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as DeceptionHkAction)}
      onSubmit={() => dispatch({ type: "submit" } as DeceptionHkAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, DeceptionHk_CFG)}
      intro={FLAVOR}
    />
  );
}
