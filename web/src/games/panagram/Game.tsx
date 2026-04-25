import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { PanagramState, PanagramAction } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

type PanagramSettings = Record<string, never>;

// Hive layout: positions for 7 hexagons (3x3 grid with corners hidden)
// Center at [1][1], outer at [0][0],[0][1],[0][2],[1][0],[1][2],[2][0],[2][1] — pick 6
const HIVE_POSITIONS = [
  { row: 0, col: 0, idx: 0 }, // outer[0]
  { row: 0, col: 1, idx: 1 }, // outer[1]
  { row: 0, col: 2, idx: 2 }, // outer[2]
  { row: 1, col: 0, idx: 3 }, // outer[3]
  { row: 1, col: 1, idx: -1 }, // center
  { row: 1, col: 2, idx: 4 }, // outer[4]
  { row: 2, col: 0, idx: 5 }, // outer[5]
  { row: 2, col: 1, idx: -2 }, // empty
  { row: 2, col: 2, idx: -3 }, // empty
];

export function Panagram({ state, dispatch, onGameOver }: GameProps<PanagramState, PanagramSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (state.phase !== "playing") return;
      if (e.key === "Enter") dispatch({ type: "submit" } as PanagramAction);
      else if (e.key === "Backspace") dispatch({ type: "backspace" } as PanagramAction);
      else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "letter", char: e.key.toUpperCase() } as PanagramAction);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.phase, dispatch]);

  const isBad = state.message.startsWith("Too") || state.message.startsWith("Must") || state.message.startsWith("Not") || state.message.startsWith("Already") || state.message.startsWith("Letter");

  if (state.phase === "done") {
    return (
      <div className="panagram-wrap">
        <div className="panagram-title">Pangram</div>
        <div className="panagram-done">
          <h2>Game Over</h2>
          <p style={{ fontWeight: 900, fontSize: "1.5rem", color: "#27ae60" }}>Score: {state.score}</p>
          <p>Found {state.found.length} words</p>
        </div>
        <div className="panagram-found-bar">
          {state.found.map(w => (
            <span key={w} className={`panagram-word-chip${state.pangrams.includes(w) ? " pangram" : ""}`}>{w}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="panagram-wrap">
      <div className="panagram-title">Pangram</div>
      <div className="panagram-score">Score: {state.score} | Found: {state.found.length}</div>

      <div className="panagram-found-bar">
        {state.found.length === 0
          ? <span style={{ color: "#bdc3c7", fontSize: "0.85rem" }}>Found words appear here…</span>
          : state.found.map(w => (
            <span key={w} className={`panagram-word-chip${state.pangrams.includes(w) ? " pangram" : ""}`}>{w}</span>
          ))
        }
      </div>

      <div className="panagram-current">{state.current || "…"}</div>

      <div className="panagram-hive">
        {HIVE_POSITIONS.map(({ row, col, idx }, i) => {
          if (idx === -2 || idx === -3) return <div key={i} className="panagram-hex empty" />;
          const isCenter = idx === -1;
          const letter = isCenter ? state.centerLetter : state.outerLetters[idx] ?? "";
          return (
            <button
              key={i}
              className={`panagram-hex ${isCenter ? "center" : "outer"}`}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              onClick={() => dispatch({ type: "letter", char: letter } as PanagramAction)}
            >{letter}</button>
          );
        })}
      </div>

      <div className={`panagram-message${isBad ? " bad" : ""}`}>{state.message}</div>

      <div className="panagram-btns">
        <button className="panagram-btn secondary" onClick={() => dispatch({ type: "backspace" } as PanagramAction)}>⌫</button>
        <button className="panagram-btn secondary" onClick={() => dispatch({ type: "shuffle" } as PanagramAction)}>Shuffle</button>
        <button className="panagram-btn" onClick={() => dispatch({ type: "submit" } as PanagramAction)}>Enter</button>
        <button className="panagram-btn end" onClick={() => dispatch({ type: "endGame" } as PanagramAction)}>End</button>
      </div>

      <p style={{ fontSize: "0.78rem", color: "#7f8c8d", textAlign: "center" }}>
        Center letter <strong>{state.centerLetter}</strong> required in every word. Min 4 letters. Find the pangram (uses all 7 letters) for bonus points!
      </p>
    </div>
  );
}
