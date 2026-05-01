import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { SleuthMiniState, SleuthMiniAction, SleuthMiniSettings } from "./state.js";
import { SleuthMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SleuthMiniGame({ state, dispatch, onGameOver }: GameProps<SleuthMiniState, SleuthMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="slt"
      cfg={SleuthMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as SleuthMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as SleuthMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, SleuthMini_CFG)}
      intro={FLAVOR}
    />
  );
}
