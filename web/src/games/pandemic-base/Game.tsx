import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicBaseState, PandemicBaseAction, PandemicBaseSettings } from "./state.js";
import { PandemicBase_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicBaseGame({ state, dispatch, onGameOver }: GameProps<PandemicBaseState, PandemicBaseSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pandebase"
      cfg={PandemicBase_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicBaseAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicBase_CFG)}
      intro={FLAVOR}
    />
  );
}
