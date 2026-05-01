import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { AeonsEndWarEternalState, AeonsEndWarEternalAction, AeonsEndWarEternalSettings } from "./state.js";
import { AeonsEndWarEternal_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function AeonsEndWarEternalGame({ state, dispatch, onGameOver }: GameProps<AeonsEndWarEternalState, AeonsEndWarEternalSettings>): JSX.Element {
  return (
    <CoopView
      prefix="aeonwareE"
      cfg={AeonsEndWarEternal_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as AeonsEndWarEternalAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, AeonsEndWarEternal_CFG)}
      intro={FLAVOR}
    />
  );
}
