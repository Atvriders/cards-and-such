import { useEffect } from "react";
import type { DeductionConfig, DeductionState } from "./deduction-engine.js";

export interface DeductionViewProps {
  prefix: string;
  cfg: DeductionConfig;
  state: DeductionState;
  onSet: (position: number, value: number) => void;
  onSubmit: () => void;
  onGameOver: (score: number) => void;
  scoreFn: (s: DeductionState) => { score: number; won: boolean } | null;
  intro?: string;
}

export function DeductionView({ prefix, cfg, state, onSet, onSubmit, onGameOver, scoreFn, intro }: DeductionViewProps): JSX.Element {
  const r = scoreFn(state);
  useEffect(() => { if (r) onGameOver(r.score); }, [r, onGameOver]);
  const p = prefix;
  if (state.phase !== "guess" && r) {
    return (
      <div className={`${p}-wrap`}>
        <div className={`${p}-final`}>
          <h2 className={`${p}-final-title`}>{r.won ? "Solved!" : "Out of Guesses"}</h2>
          <div className={`${p}-final-score`}>{r.score} pts</div>
          <div className={`${p}-final-stats`}>Answer: {state.answer.map(i => cfg.symbolLabels[i] ?? "?").join(" · ")}</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`${p}-wrap`}>
      <div className={`${p}-header`}>
        <span className={`${p}-icon`}>{cfg.scenarioEmoji}</span>
        <span className={`${p}-scenario`}>{cfg.scenarioLabel}</span>
        <span className={`${p}-round`}>{state.guesses.length}/{cfg.maxGuesses}</span>
      </div>
      {intro && <div className={`${p}-intro`}>{intro}</div>}
      <div className={`${p}-history`}>
        {state.guesses.map((g, gi) => (
          <div key={gi} className={`${p}-row`}>
            <div className={`${p}-row-pegs`}>
              {g.guess.map((v, i) => (
                <span key={i} className={`${p}-peg`} style={{ background: pegColor(v, cfg.poolSize) }}>{cfg.symbolLabels[v] ?? v}</span>
              ))}
            </div>
            <div className={`${p}-row-fb`}>
              <span className={`${p}-fb-exact`}>● {g.fb.exact}</span>
              <span className={`${p}-fb-partial`}>○ {g.fb.partial}</span>
            </div>
          </div>
        ))}
      </div>
      <div className={`${p}-current`}>
        {state.current.map((v, i) => (
          <button
            key={i}
            type="button"
            className={`${p}-slot`}
            style={{ background: pegColor(v, cfg.poolSize) }}
            onClick={() => onSet(i, (v + 1) % cfg.poolSize)}
            title="Click to cycle"
          >{cfg.symbolLabels[v] ?? v}</button>
        ))}
      </div>
      <button className={`${p}-submit`} type="button" onClick={onSubmit}>Submit Guess</button>
    </div>
  );
}

function pegColor(v: number, total: number): string {
  const palette = ["#dc2626","#f59e0b","#facc15","#16a34a","#0891b2","#3b82f6","#7c3aed","#db2777","#374151","#a16207"];
  return palette[v % palette.length] ?? `hsl(${(v * 360) / total},70%,55%)`;
}
