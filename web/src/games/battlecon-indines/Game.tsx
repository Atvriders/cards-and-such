import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { BattleconIndinesState, BattleconIndinesAction, BattleconIndinesSettings } from "./state.js";
import { BattleconIndines_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function BattleconIndinesGame({ state, dispatch, onGameOver }: GameProps<BattleconIndinesState, BattleconIndinesSettings>): JSX.Element {
  return (
    <CoopView
      prefix="bcni"
      cfg={BattleconIndines_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as BattleconIndinesAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, BattleconIndines_CFG)}
      intro={FLAVOR}
    />
  );
}
