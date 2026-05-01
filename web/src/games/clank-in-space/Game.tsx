import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ClankInSpaceState, ClankInSpaceAction, ClankInSpaceSettings } from "./state.js";
import { ClankInSpace_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ClankInSpaceGame({ state, dispatch, onGameOver }: GameProps<ClankInSpaceState, ClankInSpaceSettings>): JSX.Element {
  return (
    <CoopView
      prefix="cks"
      cfg={ClankInSpace_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ClankInSpaceAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ClankInSpace_CFG)}
      intro={FLAVOR}
    />
  );
}
