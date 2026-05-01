import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CryptidUrbanRollState, CryptidUrbanRollAction, CryptidUrbanRollSettings } from "./state.js";
import { CryptidUrbanRoll_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CryptidUrbanRollGame({ state, dispatch, onGameOver }: GameProps<CryptidUrbanRollState, CryptidUrbanRollSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="cur"
      cfg={CryptidUrbanRoll_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CryptidUrbanRollAction)}
      onSubmit={() => dispatch({ type: "submit" } as CryptidUrbanRollAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CryptidUrbanRoll_CFG)}
      intro={FLAVOR}
    />
  );
}
