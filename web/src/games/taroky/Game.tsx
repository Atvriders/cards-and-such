import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TarokyState, TarokyAction, TarokySettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TarokyGame({ state, dispatch, onGameOver }: GameProps<TarokyState, TarokySettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TarokyAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="tarky"
      title="Taroky"
    />
  );
}
