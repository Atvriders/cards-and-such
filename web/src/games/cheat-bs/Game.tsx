import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CheatBsState, CheatBsAction, CheatBsSettings } from "./state.js";
import { CheatBs_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CheatBsGame({ state, dispatch, onGameOver }: GameProps<CheatBsState, CheatBsSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="ch"
      cfg={CheatBs_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CheatBsAction)}
      onSubmit={() => dispatch({ type: "submit" } as CheatBsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CheatBs_CFG)}
      intro={FLAVOR}
    />
  );
}
