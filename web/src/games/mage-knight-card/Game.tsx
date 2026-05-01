import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { MageKnightCardState, MageKnightCardAction, MageKnightCardSettings } from "./state.js";
import { MageKnightCard_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function MageKnightCardGame({ state, dispatch, onGameOver }: GameProps<MageKnightCardState, MageKnightCardSettings>): JSX.Element {
  return (
    <CoopView
      prefix="mkc"
      cfg={MageKnightCard_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as MageKnightCardAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, MageKnightCard_CFG)}
      intro={FLAVOR}
    />
  );
}
