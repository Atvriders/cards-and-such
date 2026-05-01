import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { Code777MiniState, Code777MiniAction, Code777MiniSettings } from "./state.js";
import { Code777Mini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function Code777MiniGame({ state, dispatch, onGameOver }: GameProps<Code777MiniState, Code777MiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="c777"
      cfg={Code777Mini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as Code777MiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as Code777MiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Code777Mini_CFG)}
      intro={FLAVOR}
    />
  );
}
