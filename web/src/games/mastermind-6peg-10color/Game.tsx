import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { Mastermind6peg10colorState, Mastermind6peg10colorAction, Mastermind6peg10colorSettings } from "./state.js";
import { Mastermind6peg10color_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function Mastermind6peg10colorGame({ state, dispatch, onGameOver }: GameProps<Mastermind6peg10colorState, Mastermind6peg10colorSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="mm610"
      cfg={Mastermind6peg10color_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as Mastermind6peg10colorAction)}
      onSubmit={() => dispatch({ type: "submit" } as Mastermind6peg10colorAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Mastermind6peg10color_CFG)}
      intro={FLAVOR}
    />
  );
}
