import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { CrewDistressSignalState, CrewDistressSignalAction, CrewDistressSignalSettings } from "./state.js";
import { CrewDistressSignal_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CrewDistressSignalGame({ state, dispatch, onGameOver }: GameProps<CrewDistressSignalState, CrewDistressSignalSettings>): JSX.Element {
  return (
    <CoopView
      prefix="crewDistr"
      cfg={CrewDistressSignal_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as CrewDistressSignalAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, CrewDistressSignal_CFG)}
      intro={FLAVOR}
    />
  );
}
