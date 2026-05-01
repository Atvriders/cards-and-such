import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { HogwartsBattleCoopState, HogwartsBattleCoopAction, HogwartsBattleCoopSettings } from "./state.js";
import { HogwartsBattleCoop_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function HogwartsBattleCoopGame({ state, dispatch, onGameOver }: GameProps<HogwartsBattleCoopState, HogwartsBattleCoopSettings>): JSX.Element {
  return (
    <CoopView
      prefix="hogBatCop"
      cfg={HogwartsBattleCoop_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as HogwartsBattleCoopAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, HogwartsBattleCoop_CFG)}
      intro={FLAVOR}
    />
  );
}
