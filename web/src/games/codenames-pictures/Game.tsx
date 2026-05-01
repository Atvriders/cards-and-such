import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CodenamesPicturesState, CodenamesPicturesAction, CodenamesPicturesSettings } from "./state.js";
import { CodenamesPictures_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CodenamesPicturesGame({ state, dispatch, onGameOver }: GameProps<CodenamesPicturesState, CodenamesPicturesSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="cnp"
      cfg={CodenamesPictures_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CodenamesPicturesAction)}
      onSubmit={() => dispatch({ type: "submit" } as CodenamesPicturesAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CodenamesPictures_CFG)}
      intro={FLAVOR}
    />
  );
}
