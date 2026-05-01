import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SpiritIslandJaggedState, SpiritIslandJaggedAction, SpiritIslandJaggedSettings } from "./state.js";
import { SpiritIslandJagged_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SpiritIslandJaggedGame({ state, dispatch, onGameOver }: GameProps<SpiritIslandJaggedState, SpiritIslandJaggedSettings>): JSX.Element {
  return (
    <CoopView
      prefix="spj"
      cfg={SpiritIslandJagged_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SpiritIslandJaggedAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SpiritIslandJagged_CFG)}
      intro={FLAVOR}
    />
  );
}
