import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GeierState, GeierAction, GeierSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function GeierGame({ state, dispatch, onGameOver }: GameProps<GeierState, GeierSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as GeierAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="geier"
      title="Geier"
    />
  );
}
