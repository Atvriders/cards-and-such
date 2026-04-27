import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { QuartetQuestState, QuartetQuestAction, QuartetQuestSettings } from "./state.js";
import { isTerminal, cardName, isRed, TOTAL_DRAWS } from "./state.js";
import "./Game.css";
export function QuartetQuestGame({ state, dispatch, onGameOver }: GameProps<QuartetQuestState, QuartetQuestSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return <div className="cm-wrap"><div className="cm-done"><h2>Done!</h2><div>Quartets found: {state.quartets}</div><div className="cm-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="cm-wrap">
      <div className="cm-info">Draw {state.draw} / {TOTAL_DRAWS} — Quartets: {state.quartets}</div>
      <div className="cm-score">{state.score} pts</div>
      {state.hand.length > 0 && (
        <div className="cm-row">
          {state.hand.slice(-10).map((c, i) => <div key={i} className={`cm-card ${isRed(c) ? "red" : "black"}`}>{cardName(c)}</div>)}
        </div>
      )}
      {state.phase === "drawing" && (
        <button className="cm-btn" onClick={() => dispatch({ type:"draw" } as QuartetQuestAction)}>Draw a card</button>
      )}
      {state.phase === "scored" && (
        <>
          <div className="cm-result">{state.lastQuartetRank !== null ? `Four of a kind! +60` : `No quartet yet.`}</div>
          <button className="cm-btn alt" onClick={() => dispatch({ type:"next" } as QuartetQuestAction)}>Continue</button>
        </>
      )}
    </div>
  );
}
