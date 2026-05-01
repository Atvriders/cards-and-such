import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { SuperMastermindState, SuperMastermindAction, SuperMastermindSettings } from "./state.js";
import { SuperMastermind_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SuperMastermindGame({ state, dispatch, onGameOver }: GameProps<SuperMastermindState, SuperMastermindSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="smm"
      cfg={SuperMastermind_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as SuperMastermindAction)}
      onSubmit={() => dispatch({ type: "submit" } as SuperMastermindAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, SuperMastermind_CFG)}
      intro={FLAVOR}
    />
  );
}
