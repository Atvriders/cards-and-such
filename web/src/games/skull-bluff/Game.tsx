import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { SkullBluffState, SkullBluffAction, SkullBluffSettings } from "./state.js";
import { SkullBluff_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SkullBluffGame({ state, dispatch, onGameOver }: GameProps<SkullBluffState, SkullBluffSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="sk"
      cfg={SkullBluff_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as SkullBluffAction)}
      onSubmit={() => dispatch({ type: "submit" } as SkullBluffAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, SkullBluff_CFG)}
      intro={FLAVOR}
    />
  );
}
