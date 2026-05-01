import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ArkhamLcgCoopState, ArkhamLcgCoopAction, ArkhamLcgCoopSettings } from "./state.js";
import { ArkhamLcgCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ArkhamLcgCoopGame({ state, dispatch, onGameOver }: GameProps<ArkhamLcgCoopState, ArkhamLcgCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="arkhamCop"
      cfg={ArkhamLcgCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ArkhamLcgCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ArkhamLcgCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
