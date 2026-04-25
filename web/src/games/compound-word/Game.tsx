import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { CompoundState, CompoundAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type CompoundSettings = Record<string, never>;

export function CompoundWord({ state, dispatch, onGameOver }: GameProps<CompoundState, CompoundSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  if (state.phase === "done") {
    const solved = state.solved.filter(Boolean).length;
    return (
      <div className="compound-wrap">
        <div className="compound-title">Compound Word</div>
        <div className="compound-done">
          <h2>Finished!</h2>
          <p>Solved {solved} of {state.puzzles.length} puzzles</p>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
        </div>
        <div className="compound-solved-list">
          {state.puzzles.map((p, i) => (
            <span key={i} className="compound-solved-chip" style={{ background: state.solved[i] ? "#27ae60" : "#95a5a6" }}>
              {p.answer}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const puzzle = state.puzzles[state.current]!;

  return (
    <div className="compound-wrap">
      <div className="compound-title">Compound Word</div>
      <div className="compound-progress">Puzzle {state.current + 1} / {state.puzzles.length}</div>
      <div className="compound-score-bar">Score: {state.score}</div>

      <div className="compound-clue-row">
        <span className="compound-clue-a">{puzzle.clueA}</span>
        <span className="compound-plus">+</span>
        <span className="compound-clue-b">{puzzle.clueB}</span>
        <span className="compound-plus">= ?</span>
      </div>

      <div className="compound-hints">
        <em>{puzzle.clueA}</em> = {puzzle.hintA} &nbsp;|&nbsp; <em>{puzzle.clueB}</em> = {puzzle.hintB}
      </div>

      <div className="compound-input-row">
        <input
          className="compound-input"
          type="text"
          placeholder="Type the compound word…"
          value={state.input}
          autoFocus
          onChange={e => dispatch({ type: "type", text: e.target.value } as CompoundAction)}
          onKeyDown={e => { if (e.key === "Enter") dispatch({ type: "submit" } as CompoundAction); }}
        />
        <button className="compound-btn" onClick={() => dispatch({ type: "submit" } as CompoundAction)}>
          Go
        </button>
        <button className="compound-btn skip" onClick={() => dispatch({ type: "skip" } as CompoundAction)}>
          Skip
        </button>
      </div>
      <div className="compound-error">{state.error}</div>
    </div>
  );
}
