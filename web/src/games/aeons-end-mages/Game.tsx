import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { AeonsEndMagesState, AeonsEndMagesAction, AeonsEndMagesSettings } from "./state.js";
import { AeonsEndMages_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function AeonsEndMagesGame({ state, dispatch, onGameOver }: GameProps<AeonsEndMagesState, AeonsEndMagesSettings>): JSX.Element {
  return (
    <CoopView
      prefix="aem"
      cfg={AeonsEndMages_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as AeonsEndMagesAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, AeonsEndMages_CFG)}
      intro={FLAVOR}
    />
  );
}
