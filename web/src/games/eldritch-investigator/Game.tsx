import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { EldritchInvestigatorState, EldritchInvestigatorAction, EldritchInvestigatorSettings } from "./state.js";
import { EldritchInvestigator_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function EldritchInvestigatorGame({ state, dispatch, onGameOver }: GameProps<EldritchInvestigatorState, EldritchInvestigatorSettings>): JSX.Element {
  return (
    <CoopView
      prefix="ehi"
      cfg={EldritchInvestigator_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as EldritchInvestigatorAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, EldritchInvestigator_CFG)}
      intro={FLAVOR}
    />
  );
}
