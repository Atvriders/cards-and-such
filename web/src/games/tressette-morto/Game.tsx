import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TressetteMortoState, TressetteMortoAction, TressetteMortoSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function TressetteMortoGame({ state, dispatch, onGameOver }: GameProps<TressetteMortoState, TressetteMortoSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as TressetteMortoAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="tremc"
      title="Tressette Morto"
    />
  );
}
