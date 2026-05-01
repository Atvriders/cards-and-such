import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WenzState, WenzAction, WenzSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function WenzGame({ state, dispatch, onGameOver }: GameProps<WenzState, WenzSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as WenzAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="wenz"
      title="Wenz"
    />
  );
}
