import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MagicMazeCoopState, MagicMazeCoopAction, MagicMazeCoopSettings } from "./state.js";
import { MagicMazeCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MagicMazeCoopGame({ state, dispatch, onGameOver }: GameProps<MagicMazeCoopState, MagicMazeCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="magMzCoop"
      cfg={MagicMazeCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MagicMazeCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MagicMazeCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
