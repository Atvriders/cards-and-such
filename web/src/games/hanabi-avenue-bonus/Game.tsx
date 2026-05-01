import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { HanabiAvenueBonusState, HanabiAvenueBonusAction, HanabiAvenueBonusSettings } from "./state.js";
import { HanabiAvenueBonus_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function HanabiAvenueBonusGame({ state, dispatch, onGameOver }: GameProps<HanabiAvenueBonusState, HanabiAvenueBonusSettings>): JSX.Element {
  return (
    <CoopView
      prefix="hanabiAvB"
      cfg={HanabiAvenueBonus_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as HanabiAvenueBonusAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, HanabiAvenueBonus_CFG)}
      intro={FLAVOR}
    />
  );
}
