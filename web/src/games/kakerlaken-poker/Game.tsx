import type { GameProps } from "../../platform/game-plugin/types.js";
import { DeductionView } from "../_shared/DeductionView.js";
import { deductionScore } from "../_shared/deduction-engine.js";
import type { KakerlakenPokerState, KakerlakenPokerAction, KakerlakenPokerSettings } from "./state.js";
import { KakerlakenPoker_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function KakerlakenPokerGame({ state, dispatch, onGameOver }: GameProps<KakerlakenPokerState, KakerlakenPokerSettings>): JSX.Element {
  return (
    <DeductionView
      prefix="kpk"
      cfg={KakerlakenPoker_CFG}
      state={state}
      onSet={(position, value) => dispatch({ type: "set", position, value } as KakerlakenPokerAction)}
      onSubmit={() => dispatch({ type: "submit" } as KakerlakenPokerAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => deductionScore(s, KakerlakenPoker_CFG)}
      intro={FLAVOR}
    />
  );
}
