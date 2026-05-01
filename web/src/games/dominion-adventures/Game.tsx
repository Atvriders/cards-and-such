import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DominionAdventuresState, DominionAdventuresAction, DominionAdventuresSettings } from "./state.js";
import { DominionAdventures_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DominionAdventuresGame({ state, dispatch, onGameOver }: GameProps<DominionAdventuresState, DominionAdventuresSettings>): JSX.Element {
  return (
    <CoopView
      prefix="dma"
      cfg={DominionAdventures_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DominionAdventuresAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DominionAdventures_CFG)}
      intro={FLAVOR}
    />
  );
}
