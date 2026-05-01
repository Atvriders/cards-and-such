import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RubberBridgeState, RubberBridgeAction, RubberBridgeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function RubberBridgeGame({ state, dispatch, onGameOver }: GameProps<RubberBridgeState, RubberBridgeSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as RubberBridgeAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="rubberb"
      title="Rubber Bridge"
    />
  );
}
