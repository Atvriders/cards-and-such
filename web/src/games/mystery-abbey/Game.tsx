import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { MysteryAbbeyState, MysteryAbbeyAction, MysteryAbbeySettings } from "./state.js";
import { MysteryAbbey_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MysteryAbbeyGame({ state, dispatch, onGameOver }: GameProps<MysteryAbbeyState, MysteryAbbeySettings>): JSX.Element {
  return (
    <DeductionView
      prefix="myab"
      cfg={MysteryAbbey_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as MysteryAbbeyAction)}
      onSubmit={() => dispatch({ type: "submit" } as MysteryAbbeyAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, MysteryAbbey_CFG)}
      intro={FLAVOR}
    />
  );
}
