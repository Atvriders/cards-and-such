import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { OctordleMiniState, OctordleMiniAction, OctordleMiniSettings, Tile } from "./state.js";
import { isTerminal, scoreGuess, MAX_GUESSES } from "./state.js";
import "./Game.css";

const KEY_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

function buildBoard(answer: string, guesses: string[], current: string, solved: boolean): { letters: string[]; tiles: Tile[] }[] {
  const rows: { letters: string[]; tiles: Tile[] }[] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      const g = guesses[r]!;
      rows.push({ letters: g.split(""), tiles: scoreGuess(g, answer) });
    } else if (r === guesses.length && !solved) {
      const cur = current.padEnd(5, " ").split("");
      rows.push({ letters: cur, tiles: cur.map(_ => "blank") as Tile[] });
    } else {
      rows.push({ letters: [" "," "," "," "," "], tiles: ["blank","blank","blank","blank","blank"] });
    }
  }
  return rows;
}

export function OctordleMiniGame({ state, dispatch, onGameOver }: GameProps<OctordleMiniState, OctordleMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (state.status !== "playing") return;
    if (e.key === "Enter") dispatch({ type: "enter" } as OctordleMiniAction);
    else if (e.key === "Backspace") dispatch({ type: "backspace" } as OctordleMiniAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "key", ch: e.key } as OctordleMiniAction);
  }, [state.status, dispatch]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  const combined: Record<string, "absent"|"present"|"correct"|undefined> = {};
  state.guesses.forEach(g => {
    state.answers.forEach((ans) => {
      const tiles = scoreGuess(g, ans);
      for (let i = 0; i < 5; i++) {
        const ch = g[i]!;
        const t = tiles[i]!;
        if (t === "correct") combined[ch] = "correct";
        else if (t === "present" && combined[ch] !== "correct") combined[ch] = "present";
        else if (t === "absent" && !combined[ch]) combined[ch] = "absent";
      }
    });
  });

  return (
    <div className="om-wrap">
      <div className="om-header">
        <span className="om-title">{state.answers.length} Words</span>
        <span className="om-info">Guess {state.guesses.length + (state.status === "playing" ? 1 : 0)} / {MAX_GUESSES}</span>
        <span className="om-info">Solved {state.solved.filter(Boolean).length} / {state.answers.length}</span>
      </div>
      <div className="om-boards">
        {state.answers.map((ans, bi) => {
          const board = buildBoard(ans, state.guesses, state.current, state.solved[bi]!);
          return (
            <div className={`om-board ${state.solved[bi] ? "om-solved" : ""}`} key={bi}>
              {board.map((row, ri) => (
                <div className="om-row" key={ri}>
                  {row.letters.map((ch, ci) => (
                    <div className={`om-tile om-${row.tiles[ci]}`} key={ci}>{ch.trim()}</div>
                  ))}
                </div>
              ))}
              {state.status !== "playing" && !state.solved[bi] && <div className="om-answer">{ans}</div>}
            </div>
          );
        })}
      </div>
      {state.message && <div className="om-msg">{state.message}</div>}
      <div className="om-keyboard">
        {KEY_ROWS.map((row, ri) => (
          <div className="om-krow" key={ri}>
            {ri === 2 && <button className="om-key om-wide" onClick={() => dispatch({ type: "enter" } as OctordleMiniAction)}>ENTER</button>}
            {row.split("").map(ch => (
              <button key={ch} className={`om-key ${combined[ch] ? "om-k-" + combined[ch] : ""}`} onClick={() => dispatch({ type: "key", ch } as OctordleMiniAction)}>{ch}</button>
            ))}
            {ri === 2 && <button className="om-key om-wide" onClick={() => dispatch({ type: "backspace" } as OctordleMiniAction)}>DEL</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
