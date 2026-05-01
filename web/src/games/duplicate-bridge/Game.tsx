import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DuplicateBridgeState, DuplicateBridgeAction, DuplicateBridgeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function DuplicateBridgeGame({ state, dispatch, onGameOver }: GameProps<DuplicateBridgeState, DuplicateBridgeSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as DuplicateBridgeAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="dup-b"
      title="Duplicate Bridge"
    />
  );
}
