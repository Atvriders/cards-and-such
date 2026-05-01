import type { GameProps } from "../../platform/game-plugin/types.js";
import { CoopView } from "../_shared/CoopView.js";
import { coopScore } from "../_shared/coop-engine.js";
import type { ThunderstoneQuestState, ThunderstoneQuestAction, ThunderstoneQuestSettings } from "./state.js";
import { ThunderstoneQuest_CFG, FLAVOR } from "./state.js";
import "./Game.css";

export function ThunderstoneQuestGame({ state, dispatch, onGameOver }: GameProps<ThunderstoneQuestState, ThunderstoneQuestSettings>): JSX.Element {
  return (
    <CoopView
      prefix="tqs"
      cfg={ThunderstoneQuest_CFG}
      state={state}
      onPlay={(tacticId) => dispatch({ type: "play", tacticId } as ThunderstoneQuestAction)}
      onGameOver={onGameOver}
      scoreFn={(s) => coopScore(s, ThunderstoneQuest_CFG)}
      intro={FLAVOR}
    />
  );
}
