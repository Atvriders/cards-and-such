import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KonigrufenState, KonigrufenAction, KonigrufenSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function KonigrufenGame({ state, dispatch, onGameOver }: GameProps<KonigrufenState, KonigrufenSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as KonigrufenAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="kon"
      title="Königrufen"
    />
  );
}
