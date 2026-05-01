import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { AeonsEndLegacyState, AeonsEndLegacyAction, AeonsEndLegacySettings } from "./state.js";
import { AeonsEndLegacy_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function AeonsEndLegacyGame({ state, dispatch, onGameOver }: GameProps<AeonsEndLegacyState, AeonsEndLegacySettings>): JSX.Element {
  return (
    <CoopView
      prefix="ael"
      cfg={AeonsEndLegacy_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as AeonsEndLegacyAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, AeonsEndLegacy_CFG)}
      intro={FLAVOR}
    />
  );
}
