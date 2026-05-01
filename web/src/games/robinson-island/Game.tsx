import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { RobinsonIslandState, RobinsonIslandAction, RobinsonIslandSettings } from "./state.js";
import { RobinsonIsland_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function RobinsonIslandGame({ state, dispatch, onGameOver }: GameProps<RobinsonIslandState, RobinsonIslandSettings>): JSX.Element {
  return (
    <CoopView
      prefix="robIslnd9"
      cfg={RobinsonIsland_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as RobinsonIslandAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, RobinsonIsland_CFG)}
      intro={FLAVOR}
    />
  );
}
