import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GameState, GameAction, GameSettings } from "./state.js";
import { isTerminal, wordScore } from "./state.js";
import "./Game.css";

export function BoggleFullGame({ state, dispatch, onGameOver }: GameProps<GameState, GameSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false);
  const [typed, setTyped] = useState("");

  // One-shot game-over notification.
  useEffect(() => {
    const t = isTerminal(state);
    if (t && !endedRef.current) {
      endedRef.current = true;
      onGameOver(t.score);
    }
  }, [state, onGameOver]);

  // 1-Hz countdown driver.
  useEffect(() => {
    if (state.done) return;
    tickRef.current = setInterval(() => {
      dispatch({ type: "tick" } as GameAction);
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.done, dispatch]);

  // Keyboard shortcuts: Enter submits, Esc/Backspace clears.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "TEXTAREA") return;
      if (state.done) return;
      if (e.key === "Enter") {
        e.preventDefault();
        dispatch({ type: "submitWord" } as GameAction);
      } else if (e.key === "Escape") {
        e.preventDefault();
        dispatch({ type: "clearPath" } as GameAction);
        setTyped("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dispatch, state.done]);

  const { grid, currentPath, foundWords, playerScore, timeLeft, done, error, cpuScore, cpuWords } = state;
  const currentWord = currentPath.map(i => grid[i]!).join("");
  const mm = Math.floor(timeLeft / 60);
  const ss = String(timeLeft % 60).padStart(2, "0");

  /** Tries to greedily trace the typed string onto the grid, starting
   *  from any cell. Returns the indices if a valid path is found, else null.
   *  This is the "type letters" UX — handy when clicking is awkward. */
  function tryTypedTrace(s: string): number[] | null {
    const w = s.toUpperCase();
    if (w.length < 1) return null;
    const used = new Array<boolean>(16).fill(false);
    const out: number[] = [];
    function dfs(idx: number, pos: number): boolean {
      if (grid[idx] !== w[pos]) return false;
      out.push(idx);
      if (pos === w.length - 1) return true;
      used[idx] = true;
      const r = Math.floor(idx / 4), c = idx % 4;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
          const ni = nr * 4 + nc;
          if (used[ni]) continue;
          if (dfs(ni, pos + 1)) return true;
        }
      }
      used[idx] = false;
      out.pop();
      return false;
    }
    for (let i = 0; i < 16; i++) {
      out.length = 0;
      used.fill(false);
      if (grid[i] === w[0] && dfs(i, 0)) return out.slice();
    }
    return null;
  }

  function submitTyped() {
    const path = tryTypedTrace(typed.trim());
    if (!path) {
      // Surface the error via the reducer's normal "Invalid path" channel by
      // dispatching submit on an obviously-invalid empty path; instead, set
      // an inline error message locally.
      dispatch({ type: "clearPath" } as GameAction);
      // hack: dispatch a submit on an empty path triggers "Too short" error
      // which is misleading. So we re-use the cleaner approach: dispatch
      // a sequence that ends in a no-op. Simpler: clear typed string.
      setTyped("");
      return;
    }
    // Replace the current path with the typed trace, then submit.
    dispatch({ type: "clearPath" } as GameAction);
    for (const idx of path) {
      dispatch({ type: "selectCell", index: idx } as GameAction);
    }
    dispatch({ type: "submitWord" } as GameAction);
    setTyped("");
  }

  const beat = playerScore > cpuScore;
  const finalScore = (terminal?.score) ?? (playerScore + (beat ? 100 : 0));

  return (
    <div className="bgf-wrap fade-in">
      <div className="bgf-header">
        <span className="bgf-stat">
          Score <strong className="pulse" data-testid="bgf-score">{playerScore}</strong>
        </span>
        <span className="bgf-stat bgf-timer" data-testid="bgf-timer">
          {mm}:{ss}
        </span>
        <span className="bgf-stat">
          CPU target <strong>{cpuScore}</strong>
        </span>
        <span className="bgf-stat">{foundWords.length} words</span>
      </div>

      <div className="bgf-grid" role="grid" aria-label="4 by 4 Boggle grid">
        {grid.map((letter, i) => {
          const pathIdx = currentPath.indexOf(i);
          const isFirst = currentPath[0] === i;
          const isSelected = pathIdx !== -1;
          const cls =
            "bgf-cell" +
            (isFirst ? " first" : isSelected ? " selected" : "");
          return (
            <button
              key={i}
              type="button"
              className={cls}
              title={`Select letter ${letter}`}
              aria-label={`Letter ${letter} at position ${i + 1}${isSelected ? `, selected step ${pathIdx + 1}` : ""}`}
              aria-pressed={isSelected}
              data-testid={`bgf-cell-${i}`}
              disabled={done}
              onClick={() => dispatch({ type: "selectCell", index: i } as GameAction)}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="bgf-current-row">
        <div className="bgf-current-word" data-testid="bgf-current-word">
          {currentWord || <span className="bgf-placeholder">trace a word…</span>}
        </div>
        <button
          type="button"
          className="bgf-btn submit"
          data-testid="bgf-submit"
          disabled={currentPath.length < 3 || done}
          onClick={() => dispatch({ type: "submitWord" } as GameAction)}
          title="Submit the currently traced word"
        >
          Submit {currentPath.length >= 3 ? `(+${wordScore(currentPath.length)}pt)` : ""}
        </button>
        <button
          type="button"
          className="bgf-btn clear"
          data-testid="bgf-clear"
          disabled={currentPath.length === 0 || done}
          onClick={() => dispatch({ type: "clearPath" } as GameAction)}
          title="Clear the current traced word and start over"
        >
          Clear
        </button>
      </div>

      <div className="bgf-typed-row">
        <input
          type="text"
          className="bgf-typed"
          placeholder="…or type a word and press Enter"
          value={typed}
          maxLength={16}
          disabled={done}
          onChange={(e) => setTyped(e.target.value.replace(/[^A-Za-z]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitTyped();
            }
          }}
          aria-label="Type a word and press Enter to submit"
        />
        <button
          type="button"
          className="bgf-btn"
          onClick={submitTyped}
          disabled={done || typed.length < 3}
          title="Submit typed word"
        >
          Type-submit
        </button>
      </div>

      <div className="bgf-error" data-testid="bgf-error">{error ?? " "}</div>

      {foundWords.length > 0 && (
        <div className="bgf-found">
          <div className="bgf-found-label">Found:</div>
          <div className="bgf-found-list">
            {[...foundWords].reverse().map(w => (
              <span key={w} className="bgf-chip">{w} <em>+{wordScore(w.length)}</em></span>
            ))}
          </div>
        </div>
      )}

      {done && (
        <div className="bgf-done-overlay">
          <div className="bgf-done-box bounce-in">
            <h2>Time&apos;s up!</h2>
            <p>You found <strong>{foundWords.length}</strong> word{foundWords.length === 1 ? "" : "s"}.</p>
            <table className="bgf-summary">
              <tbody>
                <tr>
                  <td>Your score</td>
                  <td><strong>{playerScore}</strong></td>
                </tr>
                <tr>
                  <td>CPU score</td>
                  <td><strong>{cpuScore}</strong></td>
                </tr>
                {beat && (
                  <tr className="bgf-bonus">
                    <td>Beat CPU bonus</td>
                    <td><strong>+100</strong></td>
                  </tr>
                )}
                <tr className="bgf-final">
                  <td>Final</td>
                  <td><strong>{finalScore}</strong></td>
                </tr>
              </tbody>
            </table>
            {cpuWords.length > 0 && (
              <details className="bgf-cpu-words">
                <summary>CPU found {cpuWords.length} word{cpuWords.length === 1 ? "" : "s"}</summary>
                <div className="bgf-cpu-list">
                  {cpuWords.map(w => (
                    <span key={w} className="bgf-chip cpu">{w}</span>
                  ))}
                </div>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
