import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { Mastermind5peg8colorState, Mastermind5peg8colorAction, Mastermind5peg8colorSettings } from "./state.js";
import { Mastermind5peg8color_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function Mastermind5peg8colorGame({ state, dispatch, onGameOver }: GameProps<Mastermind5peg8colorState, Mastermind5peg8colorSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="mm58"
      cfg={Mastermind5peg8color_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as Mastermind5peg8colorAction)}
      onSubmit={() => dispatch({ type: "submit" } as Mastermind5peg8colorAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, Mastermind5peg8color_CFG)}
      intro={FLAVOR}
    />
  );
}
