import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ThirteenCluesState, ThirteenCluesAction, ThirteenCluesSettings } from "./state.js";
import { ThirteenClues_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ThirteenCluesGame({ state, dispatch, onGameOver }: GameProps<ThirteenCluesState, ThirteenCluesSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="tcl"
      cfg={ThirteenClues_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ThirteenCluesAction)}
      onSubmit={() => dispatch({ type: "submit" } as ThirteenCluesAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ThirteenClues_CFG)}
      intro={FLAVOR}
    />
  );
}
