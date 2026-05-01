import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ArkhamLcgFellowState, ArkhamLcgFellowAction, ArkhamLcgFellowSettings } from "./state.js";
import { ArkhamLcgFellow_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ArkhamLcgFellowGame({ state, dispatch, onGameOver }: GameProps<ArkhamLcgFellowState, ArkhamLcgFellowSettings>): JSX.Element {
  return (
    <CoopView
      prefix="arkhamFlw"
      cfg={ArkhamLcgFellow_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ArkhamLcgFellowAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ArkhamLcgFellow_CFG)}
      intro={FLAVOR}
    />
  );
}
