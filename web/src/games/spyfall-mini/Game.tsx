import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { SpyfallMiniState, SpyfallMiniAction, SpyfallMiniSettings } from "./state.js";
import { SpyfallMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SpyfallMiniGame({ state, dispatch, onGameOver }: GameProps<SpyfallMiniState, SpyfallMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="sfm"
      cfg={SpyfallMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as SpyfallMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as SpyfallMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, SpyfallMini_CFG)}
      intro={FLAVOR}
    />
  );
}
