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
      <div className="dobeurp-wrap">
        <div className="dobeurp-done">
          <h2>Spotted</h2>
          <div className="dobeurp-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="dobeurp-final">{state.score} pts</div>
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
    <div className="dobeurp-wrap">
      <div className="dobeurp-header">
        <span className="dobeurp-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="dobeurp-score">{state.score} pts</span>
      </div>
      <div className="dobeurp-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="dobeurp-cards">
        <div className="dobeurp-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`dobeurp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="dobeurp-vs">vs</div>
        <div className="dobeurp-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`dobeurp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`dobeurp-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="dobeurp-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="dobeurp-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
