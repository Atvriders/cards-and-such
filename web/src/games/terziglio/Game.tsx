import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TerziglioState, TerziglioAction, TerziglioSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TerziglioGame({ state, dispatch, onGameOver }: GameProps<TerziglioState, TerziglioSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TerziglioAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="terzc"
      title="Terziglio"
    />
  );
}
