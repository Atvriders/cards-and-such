import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TressetteState, TressetteAction, TressetteSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TressetteGame({ state, dispatch, onGameOver }: GameProps<TressetteState, TressetteSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TressetteAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="tre"
      title="Tressette"
    />
  );
}
