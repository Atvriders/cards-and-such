import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { MastermindNoRepeatsState, MastermindNoRepeatsAction, MastermindNoRepeatsSettings } from "./state.js";
import { MastermindNoRepeats_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MastermindNoRepeatsGame({ state, dispatch, onGameOver }: GameProps<MastermindNoRepeatsState, MastermindNoRepeatsSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="mmnr"
      cfg={MastermindNoRepeats_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as MastermindNoRepeatsAction)}
      onSubmit={() => dispatch({ type: "submit" } as MastermindNoRepeatsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, MastermindNoRepeats_CFG)}
      intro={FLAVOR}
    />
  );
}
