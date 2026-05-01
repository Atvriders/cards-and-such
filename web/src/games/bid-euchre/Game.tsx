import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BidEuchreState, BidEuchreAction, BidEuchreSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BidEuchreGame({ state, dispatch, onGameOver }: GameProps<BidEuchreState, BidEuchreSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BidEuchreAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bideu"
      title="Bid Euchre"
    />
  );
}
