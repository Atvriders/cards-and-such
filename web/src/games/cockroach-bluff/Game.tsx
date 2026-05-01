import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CockroachBluffState, CockroachBluffAction, CockroachBluffSettings } from "./state.js";
import { CockroachBluff_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CockroachBluffGame({ state, dispatch, onGameOver }: GameProps<CockroachBluffState, CockroachBluffSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="ckr"
      cfg={CockroachBluff_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CockroachBluffAction)}
      onSubmit={() => dispatch({ type: "submit" } as CockroachBluffAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CockroachBluff_CFG)}
      intro={FLAVOR}
    />
  );
}
