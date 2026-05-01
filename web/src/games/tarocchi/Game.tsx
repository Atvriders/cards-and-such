import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TarocchiState, TarocchiAction, TarocchiSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TarocchiGame({ state, dispatch, onGameOver }: GameProps<TarocchiState, TarocchiSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TarocchiAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="tarocchi"
      title="Tarocchi"
    />
  );
}
