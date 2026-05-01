import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { ChroniclesOfCrimeState, ChroniclesOfCrimeAction, ChroniclesOfCrimeSettings } from "./state.js";
import { ChroniclesOfCrime_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ChroniclesOfCrimeGame({ state, dispatch, onGameOver }: GameProps<ChroniclesOfCrimeState, ChroniclesOfCrimeSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="coc"
      cfg={ChroniclesOfCrime_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as ChroniclesOfCrimeAction)}
      onSubmit={() => dispatch({ type: "submit" } as ChroniclesOfCrimeAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, ChroniclesOfCrime_CFG)}
      intro={FLAVOR}
    />
  );
}
