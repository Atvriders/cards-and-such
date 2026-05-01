import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDeckPinochleState, DoubleDeckPinochleAction, DoubleDeckPinochleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function DoubleDeckPinochleGame({ state, dispatch, onGameOver }: GameProps<DoubleDeckPinochleState, DoubleDeckPinochleSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as DoubleDeckPinochleAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="dd-pin"
      title="Double-Deck Pinochle"
    />
  );
}
