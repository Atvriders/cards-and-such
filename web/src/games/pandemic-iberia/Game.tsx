import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicIberiaState, PandemicIberiaAction, PandemicIberiaSettings } from "./state.js";
import { PandemicIberia_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicIberiaGame({ state, dispatch, onGameOver }: GameProps<PandemicIberiaState, PandemicIberiaSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pandiber9"
      cfg={PandemicIberia_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicIberiaAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicIberia_CFG)}
      intro={FLAVOR}
    />
  );
}
