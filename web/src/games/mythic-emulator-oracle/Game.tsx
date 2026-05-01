import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { MythicEmulatorOracleState, MythicEmulatorOracleAction, MythicEmulatorOracleSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";
const LABELS = ["A", "B", "C", "D"];
export function MythicEmulatorOracleGame({ state, dispatch, onGameOver }: GameProps<MythicEmulatorOracleState, MythicEmulatorOracleSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);
  if (state.phase === "done") return <div className="meo-wrap"><div className="meo-done"><h2>Saga End</h2><p style={{ fontSize:"1.6rem", fontWeight:900, color:"#8e44ad" }}>{state.score} pts</p></div></div>;
  const p = state.prompts[state.index]!;
  const isResult = state.phase === "result";
  return (
    <div className="meo-wrap">
      <div className="meo-header">
        <span className="meo-progress">Entry {state.index + 1} / {state.prompts.length}</span>
        <span className="meo-score">{state.score} pts</span>
      </div>
      <div className="meo-prompt">{p.prompt}</div>
      <div className="meo-choices">
        {p.choices.map((c, i) => (
          <button key={i} className={`meo-choice${state.selected === i ? " selected" : ""}`} disabled={isResult} onClick={() => dispatch({ type:"choose", choice:i } as MythicEmulatorOracleAction)}>
            <span className="meo-choice-letter">{LABELS[i]}</span>{c}
          </button>
        ))}
      </div>
      {isResult && <div className="meo-feedback">+{state.lastPts} pts inscribed in your log</div>}
      <div className="meo-actions">
        {isResult && <button className="meo-btn next" onClick={() => dispatch({ type:"next" } as MythicEmulatorOracleAction)}>{state.index + 1 >= state.prompts.length ? "Finish" : "Next Entry"}</button>}
      </div>
    </div>
  );
}
