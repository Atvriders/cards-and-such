import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItClassicState, SpotItClassicAction, SpotItClassicSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItClassicGame({ state, dispatch, onGameOver }: GameProps<SpotItClassicState, SpotItClassicSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spotcls-wrap">
        <div className="spotcls-done">
          <h2>Spotted</h2>
          <div className="spotcls-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spotcls-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotItClassicAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotItClassicAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spotcls-wrap">
      <div className="spotcls-header">
        <span className="spotcls-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spotcls-score">{state.score} pts</span>
      </div>
      <div className="spotcls-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spotcls-cards">
        <div className="spotcls-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spotcls-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spotcls-vs">vs</div>
        <div className="spotcls-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spotcls-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spotcls-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spotcls-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spotcls-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
