import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OfficersSkatState, OfficersSkatAction, OfficersSkatSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function OfficersSkatGame({ state, dispatch, onGameOver }: GameProps<OfficersSkatState, OfficersSkatSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as OfficersSkatAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="off-s"
      title="Officers' Skat"
    />
  );
}
