import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { WordleMiniState, WordleMiniAction, WordleMiniSettings } from "./state.js";
import { isTerminal, scoreGuess } from "./state.js";
import "./Game.css";

const KEY_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

export function WordleMiniGame({ state, dispatch, onGameOver }: GameProps<WordleMiniState, WordleMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (state.status !== "playing") return;
    if (e.key === "Enter") dispatch({ type: "enter" } as WordleMiniAction);
    else if (e.key === "Backspace") dispatch({ type: "backspace" } as WordleMiniAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "key", ch: e.key } as WordleMiniAction);
  }, [state.status, dispatch]);
  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  // Build keyboard color status
  const keyStatus: Record<string, "absent"|"present"|"correct"|undefined> = {};
  state.guesses.forEach(g => {
    const tiles = scoreGuess(g, state.answer);
    for (let i = 0; i < 5; i++) {
      const ch = g[i]!;
      const t = tiles[i]!;
      const cur = keyStatus[ch];
      if (t === "correct") keyStatus[ch] = "correct";
      else if (t === "present" && cur !== "correct") keyStatus[ch] = "present";
      else if (t === "absent" && !cur) keyStatus[ch] = "absent";
    }
  });

  const rows: { letters: string[]; tiles: ("absent"|"present"|"correct"|"blank")[] }[] = [];
  for (let r = 0; r < state.maxGuesses; r++) {
    if (r < state.guesses.length) {
      const g = state.guesses[r]!;
      rows.push({ letters: g.split(""), tiles: scoreGuess(g, state.answer) });
    } else if (r === state.guesses.length) {
      const cur = state.current.padEnd(5, " ").split("");
      rows.push({ letters: cur, tiles: cur.map(_ => "blank") });
    } else {
      rows.push({ letters: [" "," "," "," "," "], tiles: ["blank","blank","blank","blank","blank"] });
    }
  }

  return (
    <div className="wm-wrap">
      <div className="wm-header">
        <span className="wm-title">Wordle</span>
        <span className="wm-info">Guess {state.guesses.length + (state.status === "playing" ? 1 : 0)} / {state.maxGuesses}</span>
      </div>
      <div className="wm-board">
        {rows.map((row, ri) => (
          <div className="wm-row" key={ri}>
            {row.letters.map((ch, ci) => (
              <div className={`wm-tile wm-${row.tiles[ci]}`} key={ci}>{ch.trim()}</div>
            ))}
          </div>
        ))}
      </div>
      {state.message && <div className="wm-msg">{state.status === "lost" ? `Answer: ${state.answer}` : state.message}</div>}
      <div className="wm-keyboard">
        {KEY_ROWS.map((row, ri) => (
          <div className="wm-krow" key={ri}>
            {ri === 2 && <button className="wm-key wm-wide" aria-label="Submit guess (Enter)" onClick={() => dispatch({ type: "enter" } as WordleMiniAction)}>ENTER</button>}
            {row.split("").map(ch => (
              <button
                key={ch}
                className={`wm-key ${keyStatus[ch] ? "wm-k-" + keyStatus[ch] : ""}`}
                aria-label={`Letter ${ch}${keyStatus[ch] ? `, ${keyStatus[ch]}` : ""}`}
                onClick={() => dispatch({ type: "key", ch } as WordleMiniAction)}
              >{ch}</button>
            ))}
            {ri === 2 && <button className="wm-key wm-wide" aria-label="Backspace" onClick={() => dispatch({ type: "backspace" } as WordleMiniAction)}>DEL</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
