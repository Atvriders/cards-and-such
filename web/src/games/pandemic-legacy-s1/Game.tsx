import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicLegacyS1State, PandemicLegacyS1Action, PandemicLegacyS1Settings } from "./state.js";
import { PandemicLegacyS1_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicLegacyS1Game({ state, dispatch, onGameOver }: GameProps<PandemicLegacyS1State, PandemicLegacyS1Settings>): JSX.Element {
  return (
    <CoopView
      prefix="ple1"
      cfg={PandemicLegacyS1_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicLegacyS1Action)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicLegacyS1_CFG)}
      intro={FLAVOR}
    />
  );
}
