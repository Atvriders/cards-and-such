import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { OneDeckGalaxyState, OneDeckGalaxyAction, OneDeckGalaxySettings } from "./state.js";
import { OneDeckGalaxy_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function OneDeckGalaxyGame({ state, dispatch, onGameOver }: GameProps<OneDeckGalaxyState, OneDeckGalaxySettings>): JSX.Element {
  return (
    <CoopView
      prefix="odg"
      cfg={OneDeckGalaxy_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as OneDeckGalaxyAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, OneDeckGalaxy_CFG)}
      intro={FLAVOR}
    />
  );
}
