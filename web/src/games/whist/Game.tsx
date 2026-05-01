import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WhistState, WhistAction, WhistSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function WhistGame({ state, dispatch, onGameOver }: GameProps<WhistState, WhistSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as WhistAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="whistc"
      title="Whist"
    />
  );
}
