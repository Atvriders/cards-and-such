import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { BullsAndCowsState, BullsAndCowsAction, BullsAndCowsSettings } from "./state.js";
import { BullsAndCows_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function BullsAndCowsGame({ state, dispatch, onGameOver }: GameProps<BullsAndCowsState, BullsAndCowsSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="bc"
      cfg={BullsAndCows_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as BullsAndCowsAction)}
      onSubmit={() => dispatch({ type: "submit" } as BullsAndCowsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, BullsAndCows_CFG)}
      intro={FLAVOR}
    />
  );
}
