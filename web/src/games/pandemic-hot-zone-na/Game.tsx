import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicHotZoneNaState, PandemicHotZoneNaAction, PandemicHotZoneNaSettings } from "./state.js";
import { PandemicHotZoneNa_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicHotZoneNaGame({ state, dispatch, onGameOver }: GameProps<PandemicHotZoneNaState, PandemicHotZoneNaSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pandhotna"
      cfg={PandemicHotZoneNa_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicHotZoneNaAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicHotZoneNa_CFG)}
      intro={FLAVOR}
    />
  );
}
