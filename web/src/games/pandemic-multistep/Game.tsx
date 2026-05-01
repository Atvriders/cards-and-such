import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicMultistepState, PandemicMultistepAction, PandemicMultistepSettings } from "./state.js";
import { PandemicMultistep_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicMultistepGame({ state, dispatch, onGameOver }: GameProps<PandemicMultistepState, PandemicMultistepSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pandmulti"
      cfg={PandemicMultistep_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicMultistepAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicMultistep_CFG)}
      intro={FLAVOR}
    />
  );
}
