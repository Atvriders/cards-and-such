import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DobbleCampingState, DobbleCampingAction, DobbleCampingSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function DobbleCampingGame({ state, dispatch, onGameOver }: GameProps<DobbleCampingState, DobbleCampingSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="dobcmp-wrap">
        <div className="dobcmp-done">
          <h2>Spotted</h2>
          <div className="dobcmp-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="dobcmp-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as DobbleCampingAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as DobbleCampingAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="dobcmp-wrap">
      <div className="dobcmp-header">
        <span className="dobcmp-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="dobcmp-score">{state.score} pts</span>
      </div>
      <div className="dobcmp-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="dobcmp-cards">
        <div className="dobcmp-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`dobcmp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="dobcmp-vs">vs</div>
        <div className="dobcmp-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`dobcmp-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`dobcmp-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="dobcmp-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="dobcmp-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
