import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { InsiderQuizState, InsiderQuizAction, InsiderQuizSettings } from "./state.js";
import { InsiderQuiz_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function InsiderQuizGame({ state, dispatch, onGameOver }: GameProps<InsiderQuizState, InsiderQuizSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="ins"
      cfg={InsiderQuiz_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as InsiderQuizAction)}
      onSubmit={() => dispatch({ type: "submit" } as InsiderQuizAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, InsiderQuiz_CFG)}
      intro={FLAVOR}
    />
  );
}
