import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { AeonsEndCoopState, AeonsEndCoopAction, AeonsEndCoopSettings } from "./state.js";
import { AeonsEndCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function AeonsEndCoopGame({ state, dispatch, onGameOver }: GameProps<AeonsEndCoopState, AeonsEndCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="aeonsCoOp"
      cfg={AeonsEndCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as AeonsEndCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, AeonsEndCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
