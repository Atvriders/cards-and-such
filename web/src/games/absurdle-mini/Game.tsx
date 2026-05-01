import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { AbsurdleMiniState, AbsurdleMiniAction, AbsurdleMiniSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

const KEY_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

export function AbsurdleMiniGame({ state, dispatch, onGameOver }: GameProps<AbsurdleMiniState, AbsurdleMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (state.status !== "playing") return;
    if (e.key === "Enter") dispatch({ type: "enter" } as AbsurdleMiniAction);
    else if (e.key === "Backspace") dispatch({ type: "backspace" } as AbsurdleMiniAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "key", ch: e.key } as AbsurdleMiniAction);
  }, [state.status, dispatch]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  const keyStatus: Record<string, "absent"|"present"|"correct"|undefined> = {};
  state.guesses.forEach(g => {
    for (let i = 0; i < 5; i++) {
      const ch = g.word[i]!;
      const t = g.tiles[i]!;
      if (t === "correct") keyStatus[ch] = "correct";
      else if (t === "present" && keyStatus[ch] !== "correct") keyStatus[ch] = "present";
      else if (t === "absent" && !keyStatus[ch]) keyStatus[ch] = "absent";
    }
  });

  const rows: { letters: string[]; tiles: ("absent"|"present"|"correct"|"blank")[] }[] = [];
  for (let r = 0; r < state.maxGuesses; r++) {
    if (r < state.guesses.length) {
      const g = state.guesses[r]!;
      rows.push({ letters: g.word.split(""), tiles: g.tiles });
    } else if (r === state.guesses.length) {
      const cur = state.current.padEnd(5, " ").split("");
      rows.push({ letters: cur, tiles: cur.map(_ => "blank") });
    } else {
      rows.push({ letters: [" "," "," "," "," "], tiles: ["blank","blank","blank","blank","blank"] });
    }
  }

  return (
    <div className="ab-wrap">
      <div className="ab-header">
        <span className="ab-title">Absurdle</span>
        <span className="ab-info">Guess {state.guesses.length + (state.status === "playing" ? 1 : 0)} / {state.maxGuesses}</span>
        <span className="ab-info">{state.candidates.length} candidates</span>
      </div>
      <div className="ab-warning">The host is adversarial — it picks the worst answer for you!</div>
      <div className="ab-board">
        {rows.map((row, ri) => (
          <div className="ab-row" key={ri}>
            {row.letters.map((ch, ci) => (
              <div className={`ab-tile ab-${row.tiles[ci]}`} key={ci}>{ch.trim()}</div>
            ))}
          </div>
        ))}
      </div>
      {state.message && <div className="ab-msg">{state.message}</div>}
      {state.status === "lost" && state.candidates.length > 0 && (
        <div className="ab-msg">Was: {state.candidates[0]}</div>
      )}
      <div className="ab-keyboard">
        {KEY_ROWS.map((row, ri) => (
          <div className="ab-krow" key={ri}>
            {ri === 2 && <button className="ab-key ab-wide" onClick={() => dispatch({ type: "enter" } as AbsurdleMiniAction)}>ENTER</button>}
            {row.split("").map(ch => (
              <button key={ch} className={`ab-key ${keyStatus[ch] ? "ab-k-" + keyStatus[ch] : ""}`} onClick={() => dispatch({ type: "key", ch } as AbsurdleMiniAction)}>{ch}</button>
            ))}
            {ri === 2 && <button className="ab-key ab-wide" onClick={() => dispatch({ type: "backspace" } as AbsurdleMiniAction)}>DEL</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
