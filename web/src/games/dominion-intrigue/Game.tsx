import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DominionIntrigueState, DominionIntrigueAction, DominionIntrigueSettings } from "./state.js";
import { DominionIntrigue_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DominionIntrigueGame({ state, dispatch, onGameOver }: GameProps<DominionIntrigueState, DominionIntrigueSettings>): JSX.Element {
  return (
    <CoopView
      prefix="dmi"
      cfg={DominionIntrigue_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DominionIntrigueAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DominionIntrigue_CFG)}
      intro={FLAVOR}
    />
  );
}
