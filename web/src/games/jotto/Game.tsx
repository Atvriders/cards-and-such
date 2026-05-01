import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { JottoState, JottoAction, JottoSettings } from "./state.js";
import { Jotto_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function JottoGame({ state, dispatch, onGameOver }: GameProps<JottoState, JottoSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="jot"
      cfg={Jotto_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as JottoAction)}
      onSubmit={() => dispatch({ type: "submit" } as JottoAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Jotto_CFG)}
      intro={FLAVOR}
    />
  );
}
