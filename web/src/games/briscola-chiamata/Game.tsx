import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BriscolaChiamataState, BriscolaChiamataAction, BriscolaChiamataSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BriscolaChiamataGame({ state, dispatch, onGameOver }: GameProps<BriscolaChiamataState, BriscolaChiamataSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BriscolaChiamataAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="briscch"
      title="Briscola Chiamata"
    />
  );
}
