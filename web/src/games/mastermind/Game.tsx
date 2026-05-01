import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { MastermindState, MastermindAction, MastermindSettings } from "./state.js";
import { Mastermind_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MastermindGame({ state, dispatch, onGameOver }: GameProps<MastermindState, MastermindSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="mm"
      cfg={Mastermind_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as MastermindAction)}
      onSubmit={() => dispatch({ type: "submit" } as MastermindAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Mastermind_CFG)}
      intro={FLAVOR}
    />
  );
}
