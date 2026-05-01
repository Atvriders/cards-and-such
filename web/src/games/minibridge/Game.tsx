import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MiniBridgeState, MiniBridgeAction, MiniBridgeSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function MiniBridgeGame({ state, dispatch, onGameOver }: GameProps<MiniBridgeState, MiniBridgeSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as MiniBridgeAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="mini-b"
      title="Mini Bridge"
    />
  );
}
