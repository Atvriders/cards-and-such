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
      <div className="gspotit-wrap">
        <div className="gspotit-done">
          <h2>Spotted</h2>
          <div className="gspotit-stats">{state.correctCount} / {state.rounds.length} hits · {(state.totalMs / 1000).toFixed(1)}s total</div>
          <div className="gspotit-final">{state.score} pts</div>
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
    <div className="gspotit-wrap">
      <div className="gspotit-header">
        <span className="gspotit-progress">Card {state.currentIndex + 1} / {state.rounds.length}</span>
        <span className="gspotit-score">{state.score} pts</span>
      </div>
      <div className="gspotit-prompt">Find the symbol on BOTH cards. Click it.</div>
      <div className="gspotit-cards">
        <div className="gspotit-card">
          {r.cardA.symbols.map((s, i) => (
            <button key={"a"+i} className={`gspotit-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
        <div className="gspotit-vs">vs</div>
        <div className="gspotit-card">
          {r.cardB.symbols.map((s, i) => (
            <button key={"b"+i} className={`gspotit-symbol${state.submitted && s === r.shared ? " hit" : ""}${state.submitted && state.selected === s && s !== r.shared ? " miss" : ""}`} disabled={state.submitted} onClick={() => onPick(s)}>{s}</button>
          ))}
        </div>
      </div>
      {state.submitted && (
        <>
          <div className={`gspotit-feedback ${isCorrect ? "ok" : "no"}`}>
            {isCorrect ? `Match in ${(state.lastMs / 1000).toFixed(1)}s` : `Miss · the match was ${r.shared}`}
          </div>
          <button className="gspotit-btn next" onClick={onNext}>{state.currentIndex + 1 >= state.rounds.length ? "Finish" : "Next"}</button>
        </>
      )}
      {!state.submitted && <div className="gspotit-timer">Speed counts · click fast for bonus points</div>}
    </div>
  );
}
