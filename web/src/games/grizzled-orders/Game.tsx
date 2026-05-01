import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { GrizzledOrdersState, GrizzledOrdersAction, GrizzledOrdersSettings } from "./state.js";
import { GrizzledOrders_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function GrizzledOrdersGame({ state, dispatch, onGameOver }: GameProps<GrizzledOrdersState, GrizzledOrdersSettings>): JSX.Element {
  return (
    <CoopView
      prefix="grzo"
      cfg={GrizzledOrders_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as GrizzledOrdersAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, GrizzledOrders_CFG)}
      intro={FLAVOR}
    />
  );
}
