import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ClueMiniState, ClueMiniAction, ClueMiniSettings } from "./state.js";
import { ClueMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ClueMiniGame({ state, dispatch, onGameOver }: GameProps<ClueMiniState, ClueMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="clm"
      cfg={ClueMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ClueMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as ClueMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ClueMini_CFG)}
      intro={FLAVOR}
    />
  );
}
