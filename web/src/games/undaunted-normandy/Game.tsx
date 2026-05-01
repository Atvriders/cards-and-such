import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { UndauntedNormandyState, UndauntedNormandyAction, UndauntedNormandySettings } from "./state.js";
import { UndauntedNormandy_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function UndauntedNormandyGame({ state, dispatch, onGameOver }: GameProps<UndauntedNormandyState, UndauntedNormandySettings>): JSX.Element {
  return (
    <CoopView
      prefix="udnn"
      cfg={UndauntedNormandy_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as UndauntedNormandyAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, UndauntedNormandy_CFG)}
      intro={FLAVOR}
    />
  );
}
