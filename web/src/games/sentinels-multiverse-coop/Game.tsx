import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SentinelsMultiverseCoopState, SentinelsMultiverseCoopAction, SentinelsMultiverseCoopSettings } from "./state.js";
import { SentinelsMultiverseCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SentinelsMultiverseCoopGame({ state, dispatch, onGameOver }: GameProps<SentinelsMultiverseCoopState, SentinelsMultiverseCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="smc"
      cfg={SentinelsMultiverseCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SentinelsMultiverseCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SentinelsMultiverseCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
