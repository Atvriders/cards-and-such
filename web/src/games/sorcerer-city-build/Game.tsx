import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SorcererCityBuildState, SorcererCityBuildAction, SorcererCityBuildSettings } from "./state.js";
import { SorcererCityBuild_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SorcererCityBuildGame({ state, dispatch, onGameOver }: GameProps<SorcererCityBuildState, SorcererCityBuildSettings>): JSX.Element {
  return (
    <CoopView
      prefix="scb"
      cfg={SorcererCityBuild_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SorcererCityBuildAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SorcererCityBuild_CFG)}
      intro={FLAVOR}
    />
  );
}
