import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { CrewQuestPlanet9State, CrewQuestPlanet9Action, CrewQuestPlanet9Settings } from "./state.js";
import { CrewQuestPlanet9_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function CrewQuestPlanet9Game({ state, dispatch, onGameOver }: GameProps<CrewQuestPlanet9State, CrewQuestPlanet9Settings>): JSX.Element {
  return (
    <CoopView
      prefix="crewQp9zz"
      cfg={CrewQuestPlanet9_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as CrewQuestPlanet9Action)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, CrewQuestPlanet9_CFG)}
      intro={FLAVOR}
    />
  );
}
