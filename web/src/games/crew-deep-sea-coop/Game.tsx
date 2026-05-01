import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { CrewDeepSeaCoopState, CrewDeepSeaCoopAction, CrewDeepSeaCoopSettings } from "./state.js";
import { CrewDeepSeaCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CrewDeepSeaCoopGame({ state, dispatch, onGameOver }: GameProps<CrewDeepSeaCoopState, CrewDeepSeaCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="crewDeepS"
      cfg={CrewDeepSeaCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as CrewDeepSeaCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, CrewDeepSeaCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
