import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DoubleDummyWhistState, DoubleDummyWhistAction, DoubleDummyWhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function DoubleDummyWhistGame({ state, dispatch, onGameOver }: GameProps<DoubleDummyWhistState, DoubleDummyWhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as DoubleDummyWhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="dd-wh"
      title="Double Dummy Whist"
    />
  );
}
