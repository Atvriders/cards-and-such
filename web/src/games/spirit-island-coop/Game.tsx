import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SpiritIslandCoopState, SpiritIslandCoopAction, SpiritIslandCoopSettings } from "./state.js";
import { SpiritIslandCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SpiritIslandCoopGame({ state, dispatch, onGameOver }: GameProps<SpiritIslandCoopState, SpiritIslandCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="spi"
      cfg={SpiritIslandCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SpiritIslandCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SpiritIslandCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
