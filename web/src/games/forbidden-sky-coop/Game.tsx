import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ForbiddenSkyCoopState, ForbiddenSkyCoopAction, ForbiddenSkyCoopSettings } from "./state.js";
import { ForbiddenSkyCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ForbiddenSkyCoopGame({ state, dispatch, onGameOver }: GameProps<ForbiddenSkyCoopState, ForbiddenSkyCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fbs"
      cfg={ForbiddenSkyCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ForbiddenSkyCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ForbiddenSkyCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
