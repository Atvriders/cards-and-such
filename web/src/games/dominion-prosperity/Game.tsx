import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { DominionProsperityState, DominionProsperityAction, DominionProsperitySettings } from "./state.js";
import { DominionProsperity_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function DominionProsperityGame({ state, dispatch, onGameOver }: GameProps<DominionProsperityState, DominionProsperitySettings>): JSX.Element {
  return (
    <CoopView
      prefix="dmp"
      cfg={DominionProsperity_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as DominionProsperityAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, DominionProsperity_CFG)}
      intro={FLAVOR}
    />
  );
}
