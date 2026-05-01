import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SpotItSplashState, SpotItSplashAction, SpotItSplashSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function SpotItSplashGame({ state, dispatch, onGameOver }: GameProps<SpotItSplashState, SpotItSplashSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="spotspl-wrap">
        <div className="spotspl-done">
          <h2>Spotted</h2>
          <div className="spotspl-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="spotspl-final">{state.score} pts</div>
        </div>
      </div>
    );
  }

  const r = state.rounds[state.currentIndex]!;
  const onPick = (sym: string): void => {
    if (state.submitted) return;
    dispatch({ type: "select", symbol: sym, nowMs: performance.now() } as SpotItSplashAction);
  };
  const onNext = (): void => {
    dispatch({ type: "next", nowMs: performance.now() } as SpotItSplashAction);
  };
  const isCorrect = state.selected === r.shared;

  return (
    <div className="spotspl-wrap">
      <div className="spotspl-header">
        <span className="spotspl-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="spotspl-score">{state.score} pts</span>
      </div>
      <div className="spotspl-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="spotspl-cards">
        <div className="spotspl-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`spotspl-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="spotspl-vs">vs</div>
        <div className="spotspl-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`spotspl-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`spotspl-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="spotspl-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="spotspl-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
