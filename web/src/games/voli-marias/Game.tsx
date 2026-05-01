import type { GameProps } from "../../platform/game-plugin/types.js";
import type { VoliMariasState, VoliMariasAction, VoliMariasSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function VoliMariasGame({ state, dispatch, onGameOver }: GameProps<VoliMariasState, VoliMariasSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as VoliMariasAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="voli-m"
      title="Volí Mariáš"
    />
  );
}
