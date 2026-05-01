import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { HpDefenceDarkArtsState, HpDefenceDarkArtsAction, HpDefenceDarkArtsSettings } from "./state.js";
import { HpDefenceDarkArts_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function HpDefenceDarkArtsGame({ state, dispatch, onGameOver }: GameProps<HpDefenceDarkArtsState, HpDefenceDarkArtsSettings>): JSX.Element {
  return (
    <CoopView
      prefix="hpDfDkArt"
      cfg={HpDefenceDarkArts_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as HpDefenceDarkArtsAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, HpDefenceDarkArts_CFG)}
      intro={FLAVOR}
    />
  );
}
