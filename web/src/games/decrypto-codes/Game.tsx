import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { DecryptoCodesState, DecryptoCodesAction, DecryptoCodesSettings } from "./state.js";
import { DecryptoCodes_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DecryptoCodesGame({ state, dispatch, onGameOver }: GameProps<DecryptoCodesState, DecryptoCodesSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="dec"
      cfg={DecryptoCodes_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as DecryptoCodesAction)}
      onSubmit={() => dispatch({ type: "submit" } as DecryptoCodesAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, DecryptoCodes_CFG)}
      intro={FLAVOR}
    />
  );
}
