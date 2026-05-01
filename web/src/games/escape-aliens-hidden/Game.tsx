import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { EscapeAliensHiddenState, EscapeAliensHiddenAction, EscapeAliensHiddenSettings } from "./state.js";
import { EscapeAliensHidden_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function EscapeAliensHiddenGame({ state, dispatch, onGameOver }: GameProps<EscapeAliensHiddenState, EscapeAliensHiddenSettings>): JSX.Element {
  return (
    <CoopView
      prefix="escAliens"
      cfg={EscapeAliensHidden_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as EscapeAliensHiddenAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, EscapeAliensHidden_CFG)}
      intro={FLAVOR}
    />
  );
}
