import type { GameProps } from "../../platform/game-plugin/types.js";
import type { LicitovanyMariasState, LicitovanyMariasAction, LicitovanyMariasSettings } from "./state.js";
import { isTerminal } from "./state.js";
import { HeadsUpTrickTable } from "../_shared/HeadsUpTrickTable.js";
import "./Game.css";

export function LicitovanyMariasGame({ state, dispatch, onGameOver }: GameProps<LicitovanyMariasState, LicitovanyMariasSettings>): JSX.Element {
  return (
    <HeadsUpTrickTable
      state={state}
      dispatch={(a) => dispatch(a as LicitovanyMariasAction)}
      onGameOver={onGameOver}
      isTerminal={isTerminal}
      prefix="lic-m"
      title="Licitovaný Mariáš"
    />
  );
}
