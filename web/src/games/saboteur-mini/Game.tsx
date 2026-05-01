import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { SaboteurMiniState, SaboteurMiniAction, SaboteurMiniSettings } from "./state.js";
import { SaboteurMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SaboteurMiniGame({ state, dispatch, onGameOver }: GameProps<SaboteurMiniState, SaboteurMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="sbt"
      cfg={SaboteurMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as SaboteurMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as SaboteurMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, SaboteurMini_CFG)}
      intro={FLAVOR}
    />
  );
}
