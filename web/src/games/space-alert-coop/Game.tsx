import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SpaceAlertCoopState, SpaceAlertCoopAction, SpaceAlertCoopSettings } from "./state.js";
import { SpaceAlertCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SpaceAlertCoopGame({ state, dispatch, onGameOver }: GameProps<SpaceAlertCoopState, SpaceAlertCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="spa"
      cfg={SpaceAlertCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SpaceAlertCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SpaceAlertCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
