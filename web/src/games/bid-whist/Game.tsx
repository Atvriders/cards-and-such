import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BidWhistState, BidWhistAction, BidWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BidWhistGame({ state, dispatch, onGameOver }: GameProps<BidWhistState, BidWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BidWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bid-wh"
      title="Bid Whist"
    />
  );
}
