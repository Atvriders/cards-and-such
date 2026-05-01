import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { SpiritIslandNatureState, SpiritIslandNatureAction, SpiritIslandNatureSettings } from "./state.js";
import { SpiritIslandNature_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function SpiritIslandNatureGame({ state, dispatch, onGameOver }: GameProps<SpiritIslandNatureState, SpiritIslandNatureSettings>): JSX.Element {
  return (
    <CoopView
      prefix="spirnatur"
      cfg={SpiritIslandNature_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as SpiritIslandNatureAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, SpiritIslandNature_CFG)}
      intro={FLAVOR}
    />
  );
}
