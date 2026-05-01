import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MagicMazeMaxSecurityState, MagicMazeMaxSecurityAction, MagicMazeMaxSecuritySettings } from "./state.js";
import { MagicMazeMaxSecurity_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MagicMazeMaxSecurityGame({ state, dispatch, onGameOver }: GameProps<MagicMazeMaxSecurityState, MagicMazeMaxSecuritySettings>): JSX.Element {
  return (
    <CoopView
      prefix="magMzMxSc"
      cfg={MagicMazeMaxSecurity_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MagicMazeMaxSecurityAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MagicMazeMaxSecurity_CFG)}
      intro={FLAVOR}
    />
  );
}
