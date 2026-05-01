import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MoneyIdolExchangerState, MoneyIdolExchangerAction, MoneyIdolExchangerSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const GEMS = ["🪙","💰","💵","💴","💶","💷"];

export function MoneyIdolExchangerGame({ state, dispatch, onGameOver }: GameProps<MoneyIdolExchangerState, MoneyIdolExchangerSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (state.phase !== "playing") { if (tickRef.current) clearInterval(tickRef.current); return; }
    tickRef.current = setInterval(() => dispatch({ type: "tick" } as MoneyIdolExchangerAction), 1000);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.phase, dispatch]);
  if (state.phase === "done") {
    return <div className="mnyidl-wrap"><div className="mnyidl-done"><h2>Time's Up!</h2><div>Matches: {state.matches}</div><div className="mnyidl-final">{state.score} pts</div></div></div>;
  }
  return (
    <div className="mnyidl-wrap">
      <div className="mnyidl-header">
        <span className="mnyidl-info">Matches: {state.matches}</span>
        <span className="mnyidl-timer">{state.ticksRemaining}s</span>
        <span className="mnyidl-score">{state.score} pts</span>
      </div>
      <div className="mnyidl-grid">
        {state.grid.map((row, r) => row.map((g, c) => {
          const sel = state.selected && state.selected[0] === r && state.selected[1] === c;
          return (
            <button key={`${r}-${c}`} className={`mnyidl-cell${sel ? " sel" : ""}`}
              onClick={() => dispatch({ type: "select", row: r, col: c } as MoneyIdolExchangerAction)}
              aria-label={`gem ${g}`}>{GEMS[g] ?? "?"}</button>
          );
        }))}
      </div>
    </div>
  );
}
