import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { LotrLcgCoopState, LotrLcgCoopAction, LotrLcgCoopSettings } from "./state.js";
import { LotrLcgCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LotrLcgCoopGame({ state, dispatch, onGameOver }: GameProps<LotrLcgCoopState, LotrLcgCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="lotrCoOp9"
      cfg={LotrLcgCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as LotrLcgCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, LotrLcgCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
