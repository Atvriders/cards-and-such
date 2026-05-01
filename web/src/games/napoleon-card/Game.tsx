import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NapoleonCardState, NapoleonCardAction, NapoleonCardSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function NapoleonCardGame({ state, dispatch, onGameOver }: GameProps<NapoleonCardState, NapoleonCardSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as NapoleonCardAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="napcard"
      title="Napoleon"
    />
  );
}
