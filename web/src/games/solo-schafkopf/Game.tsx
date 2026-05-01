import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SoloSchafkopfState, SoloSchafkopfAction, SoloSchafkopfSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function SoloSchafkopfGame({ state, dispatch, onGameOver }: GameProps<SoloSchafkopfState, SoloSchafkopfSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as SoloSchafkopfAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="sol-sk"
      title="Solo Schafkopf"
    />
  );
}
