import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ApothecariaWitchState, ApothecariaWitchAction, ApothecariaWitchSettings } from "./state.js";
import { ApothecariaWitch_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ApothecariaWitchGame({ state, dispatch, onGameOver }: GameProps<ApothecariaWitchState, ApothecariaWitchSettings>): JSX.Element {
  return (
    <CoopView
      prefix="apw"
      cfg={ApothecariaWitch_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ApothecariaWitchAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ApothecariaWitch_CFG)}
      intro={FLAVOR}
    />
  );
}
