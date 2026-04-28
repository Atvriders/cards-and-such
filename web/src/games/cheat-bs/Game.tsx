import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CheatBsState, CheatBsAction, CheatBsSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function CheatBsGame({ state, dispatch, onGameOver }: GameProps<CheatBsState, CheatBsSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") {
    return (
      <div className="bluff-wrap">
        <div className="bluff-done">
          <h2>Game Over</h2>
          <p>Correct calls: {state.callsCorrect} / {state.rounds.length}</p>
          <p className="bluff-final">{state.score} pts</p>
        </div>
      </div>
    );
  }
  const r = state.rounds[state.currentIndex]!;
  const showTell = r.tellLevel > 60;
  return (
    <div className="bluff-wrap">
      <div className="bluff-header">
        <span>Round {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="bluff-score">{state.score} pts</span>
      </div>
      <div className="bluff-claim">
        <div className="bluff-cpu-line">CPU claims:</div>
        <div className="bluff-claim-text">"I played a {r.cpuClaim}"</div>
        {showTell && !state.resolved && <div className="bluff-tell">CPU is fidgeting nervously…</div>}
        {!showTell && !state.resolved && <div className="bluff-tell calm">CPU looks calm.</div>}
      </div>
      {!state.resolved && (
        <div className="bluff-actions">
          <button className="bluff-btn trust" onClick={() => dispatch({ type: "decide", decision: "trust" } as CheatBsAction)}>Trust</button>
          <button className="bluff-btn call" onClick={() => dispatch({ type: "decide", decision: "callBluff" } as CheatBsAction)}>Call Bluff!</button>
        </div>
      )}
      {state.resolved && (
        <div className="bluff-result">
          <div className="bluff-reveal">CPU actually had: <strong>{r.cpuActual}</strong></div>
          <div className={`bluff-feedback ${(state.decision === "callBluff") === r.isBluffing ? "ok" : "no"}`}>
            {(state.decision === "callBluff") === r.isBluffing ? "+100 pts" : "Wrong call!"}
          </div>
          <button className="bluff-btn next" onClick={() => dispatch({ type: "next" } as CheatBsAction)}>
            {state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}
