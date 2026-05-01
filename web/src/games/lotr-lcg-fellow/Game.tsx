import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { LotrLcgFellowState, LotrLcgFellowAction, LotrLcgFellowSettings } from "./state.js";
import { LotrLcgFellow_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LotrLcgFellowGame({ state, dispatch, onGameOver }: GameProps<LotrLcgFellowState, LotrLcgFellowSettings>): JSX.Element {
  return (
    <CoopView
      prefix="lotrf"
      cfg={LotrLcgFellow_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as LotrLcgFellowAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, LotrLcgFellow_CFG)}
      intro={FLAVOR}
    />
  );
}
