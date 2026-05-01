import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { FourSoulsIsaacState, FourSoulsIsaacAction, FourSoulsIsaacSettings } from "./state.js";
import { FourSoulsIsaac_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function FourSoulsIsaacGame({ state, dispatch, onGameOver }: GameProps<FourSoulsIsaacState, FourSoulsIsaacSettings>): JSX.Element {
  return (
    <CoopView
      prefix="fsi"
      cfg={FourSoulsIsaac_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as FourSoulsIsaacAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, FourSoulsIsaac_CFG)}
      intro={FLAVOR}
    />
  );
}
