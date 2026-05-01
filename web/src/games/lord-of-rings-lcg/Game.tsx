import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { LordOfRingsLcgState, LordOfRingsLcgAction, LordOfRingsLcgSettings } from "./state.js";
import { LordOfRingsLcg_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function LordOfRingsLcgGame({ state, dispatch, onGameOver }: GameProps<LordOfRingsLcgState, LordOfRingsLcgSettings>): JSX.Element {
  return (
    <CoopView
      prefix="lordRgLcg"
      cfg={LordOfRingsLcg_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as LordOfRingsLcgAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, LordOfRingsLcg_CFG)}
      intro={FLAVOR}
    />
  );
}
