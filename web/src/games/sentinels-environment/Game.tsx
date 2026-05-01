import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SentinelsEnvironmentState, SentinelsEnvironmentAction, SentinelsEnvironmentSettings } from "./state.js";
import { SentinelsEnvironment_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SentinelsEnvironmentGame({ state, dispatch, onGameOver }: GameProps<SentinelsEnvironmentState, SentinelsEnvironmentSettings>): JSX.Element {
  return (
    <CoopView
      prefix="sentEnvir"
      cfg={SentinelsEnvironment_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SentinelsEnvironmentAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SentinelsEnvironment_CFG)}
      intro={FLAVOR}
    />
  );
}
