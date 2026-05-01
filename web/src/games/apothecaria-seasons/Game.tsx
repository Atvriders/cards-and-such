import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ApothecariaSeasonsState, ApothecariaSeasonsAction, ApothecariaSeasonsSettings } from "./state.js";
import { ApothecariaSeasons_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ApothecariaSeasonsGame({ state, dispatch, onGameOver }: GameProps<ApothecariaSeasonsState, ApothecariaSeasonsSettings>): JSX.Element {
  return (
    <CoopView
      prefix="aps"
      cfg={ApothecariaSeasons_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ApothecariaSeasonsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ApothecariaSeasons_CFG)}
      intro={FLAVOR}
    />
  );
}
