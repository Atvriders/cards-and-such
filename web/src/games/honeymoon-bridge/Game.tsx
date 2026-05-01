import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HoneymoonBridgeState, HoneymoonBridgeAction, HoneymoonBridgeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function HoneymoonBridgeGame({ state, dispatch, onGameOver }: GameProps<HoneymoonBridgeState, HoneymoonBridgeSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as HoneymoonBridgeAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="hm-b"
      title="Honeymoon Bridge"
    />
  );
}
