import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DominionSeasideState, DominionSeasideAction, DominionSeasideSettings } from "./state.js";
import { DominionSeaside_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DominionSeasideGame({ state, dispatch, onGameOver }: GameProps<DominionSeasideState, DominionSeasideSettings>): JSX.Element {
  return (
    <CoopView
      prefix="dms"
      cfg={DominionSeaside_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DominionSeasideAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DominionSeaside_CFG)}
      intro={FLAVOR}
    />
  );
}
