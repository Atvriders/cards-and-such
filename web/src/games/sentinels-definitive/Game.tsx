import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SentinelsDefinitiveState, SentinelsDefinitiveAction, SentinelsDefinitiveSettings } from "./state.js";
import { SentinelsDefinitive_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SentinelsDefinitiveGame({ state, dispatch, onGameOver }: GameProps<SentinelsDefinitiveState, SentinelsDefinitiveSettings>): JSX.Element {
  return (
    <CoopView
      prefix="sentDefin"
      cfg={SentinelsDefinitive_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SentinelsDefinitiveAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SentinelsDefinitive_CFG)}
      intro={FLAVOR}
    />
  );
}
