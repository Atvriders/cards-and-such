import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ClueSuspectState, ClueSuspectAction, ClueSuspectSettings } from "./state.js";
import { ClueSuspect_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ClueSuspectGame({ state, dispatch, onGameOver }: GameProps<ClueSuspectState, ClueSuspectSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="csus"
      cfg={ClueSuspect_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ClueSuspectAction)}
      onSubmit={() => dispatch({ type: "submit" } as ClueSuspectAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ClueSuspect_CFG)}
      intro={FLAVOR}
    />
  );
}
