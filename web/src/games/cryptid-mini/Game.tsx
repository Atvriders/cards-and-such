import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { CryptidMiniState, CryptidMiniAction, CryptidMiniSettings } from "./state.js";
import { CryptidMini_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CryptidMiniGame({ state, dispatch, onGameOver }: GameProps<CryptidMiniState, CryptidMiniSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="crm"
      cfg={CryptidMini_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as CryptidMiniAction)}
      onSubmit={() => dispatch({ type: "submit" } as CryptidMiniAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, CryptidMini_CFG)}
      intro={FLAVOR}
    />
  );
}
