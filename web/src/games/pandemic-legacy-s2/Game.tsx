import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicLegacyS2State, PandemicLegacyS2Action, PandemicLegacyS2Settings } from "./state.js";
import { PandemicLegacyS2_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicLegacyS2Game({ state, dispatch, onGameOver }: GameProps<PandemicLegacyS2State, PandemicLegacyS2Settings>): JSX.Element {
  return (
    <CoopView
      prefix="ple2"
      cfg={PandemicLegacyS2_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicLegacyS2Action)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicLegacyS2_CFG)}
      intro={FLAVOR}
    />
  );
}
