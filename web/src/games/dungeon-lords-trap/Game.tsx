import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DungeonLordsTrapState, DungeonLordsTrapAction, DungeonLordsTrapSettings } from "./state.js";
import { DungeonLordsTrap_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DungeonLordsTrapGame({ state, dispatch, onGameOver }: GameProps<DungeonLordsTrapState, DungeonLordsTrapSettings>): JSX.Element {
  return (
    <CoopView
      prefix="dlt"
      cfg={DungeonLordsTrap_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DungeonLordsTrapAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DungeonLordsTrap_CFG)}
      intro={FLAVOR}
    />
  );
}
