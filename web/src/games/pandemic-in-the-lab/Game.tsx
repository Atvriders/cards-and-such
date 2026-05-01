import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { PandemicInTheLabState, PandemicInTheLabAction, PandemicInTheLabSettings } from "./state.js";
import { PandemicInTheLab_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function PandemicInTheLabGame({ state, dispatch, onGameOver }: GameProps<PandemicInTheLabState, PandemicInTheLabSettings>): JSX.Element {
  return (
    <CoopView
      prefix="pitl"
      cfg={PandemicInTheLab_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as PandemicInTheLabAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, PandemicInTheLab_CFG)}
      intro={FLAVOR}
    />
  );
}
