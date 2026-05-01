import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DobbleEuropeanState, DobbleEuropeanAction, DobbleEuropeanSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DobbleEuropeanGame({ state, dispatch, onGameOver }: GameProps<DobbleEuropeanState, DobbleEuropeanSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="dobeur-wrap">
        <div className="dobeur-done">
          <h2>Spotted</h2>
          <div className="dobeur-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="dobeur-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as DobbleEuropeanAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as DobbleEuropeanAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="dobeur-wrap">
      <div className="dobeur-header">
        <span className="dobeur-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="dobeur-score">{state.score} pts</span>
      </div>
      <div className="dobeur-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="dobeur-cards">
        <div className="dobeur-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`dobeur-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="dobeur-vs">vs</div>
        <div className="dobeur-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`dobeur-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`dobeur-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="dobeur-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="dobeur-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
