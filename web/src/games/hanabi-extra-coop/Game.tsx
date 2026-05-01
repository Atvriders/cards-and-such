import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { HanabiExtraCoopState, HanabiExtraCoopAction, HanabiExtraCoopSettings } from "./state.js";
import { HanabiExtraCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function HanabiExtraCoopGame({ state, dispatch, onGameOver }: GameProps<HanabiExtraCoopState, HanabiExtraCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="hbex"
      cfg={HanabiExtraCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as HanabiExtraCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, HanabiExtraCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
