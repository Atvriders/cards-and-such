import type { GameProps } from "../../platform/game-plugin/types.js";
import type { BauernSkatState, BauernSkatAction, BauernSkatSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function BauernSkatGame({ state, dispatch, onGameOver }: GameProps<BauernSkatState, BauernSkatSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as BauernSkatAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="bau-s"
      title="Bauernskat"
    />
  );
}
