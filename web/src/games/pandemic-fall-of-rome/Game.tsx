import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicFallOfRomeState, PandemicFallOfRomeAction, PandemicFallOfRomeSettings } from "./state.js";
import { PandemicFallOfRome_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicFallOfRomeGame({ state, dispatch, onGameOver }: GameProps<PandemicFallOfRomeState, PandemicFallOfRomeSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pfor"
      cfg={PandemicFallOfRome_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicFallOfRomeAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicFallOfRome_CFG)}
      intro={FLAVOR}
    />
  );
}
