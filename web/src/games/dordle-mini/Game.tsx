import { useEffect, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DordleMiniState, DordleMiniAction, DordleMiniSettings, Tile } from "./state.js";
import { isTerminal, scoreGuess, MAX_GUESSES } from "./state.js";
import "./Game.css";

const KEY_ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];

function buildBoard(answer: string, guesses: string[], current: string, solved: boolean): { letters: string[]; tiles: Tile[] }[] {
  const rows: { letters: string[]; tiles: Tile[] }[] = [];
  for (let r = 0; r < MAX_GUESSES; r++) {
    if (r < guesses.length) {
      const g = guesses[r]!;
      // If solved before this row, show empty
      if (solved && r > guesses.indexOf(answer)) {
        rows.push({ letters: [" "," "," "," "," "], tiles: ["blank","blank","blank","blank","blank"] });
      } else {
        rows.push({ letters: g.split(""), tiles: scoreGuess(g, answer) });
      }
    } else if (r === guesses.length && !solved) {
      const cur = current.padEnd(5, " ").split("");
      rows.push({ letters: cur, tiles: cur.map(_ => "blank") as Tile[] });
    } else {
      rows.push({ letters: [" "," "," "," "," "], tiles: ["blank","blank","blank","blank","blank"] });
    }
  }
  return rows;
}

export function DordleMiniGame({ state, dispatch, onGameOver }: GameProps<DordleMiniState, DordleMiniSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (state.status !== "playing") return;
    if (e.key === "Enter") dispatch({ type: "enter" } as DordleMiniAction);
    else if (e.key === "Backspace") dispatch({ type: "backspace" } as DordleMiniAction);
    else if (/^[a-zA-Z]$/.test(e.key)) dispatch({ type: "key", ch: e.key } as DordleMiniAction);
  }, [state.status, dispatch]);
  useEffect(() => { window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onKey]);

  // Per-board key colors
  const boardKeyStatus: Record<string, "absent"|"present"|"correct"|undefined>[] = state.answers.map(() => ({}));
  state.guesses.forEach(g => {
    state.answers.forEach((ans, bi) => {
      const tiles = scoreGuess(g, ans);
      for (let i = 0; i < 5; i++) {
        const ch = g[i]!;
        const t = tiles[i]!;
        const cur = boardKeyStatus[bi]![ch];
        if (t === "correct") boardKeyStatus[bi]![ch] = "correct";
        else if (t === "present" && cur !== "correct") boardKeyStatus[bi]![ch] = "present";
        else if (t === "absent" && !cur) boardKeyStatus[bi]![ch] = "absent";
      }
    });
  });

  // Combined key status (best across boards: green > yellow > gray)
  const combined: Record<string, "absent"|"present"|"correct"|undefined> = {};
  for (const bs of boardKeyStatus) {
    for (const k of Object.keys(bs)) {
      const v = bs[k];
      if (v === "correct") combined[k] = "correct";
      else if (v === "present" && combined[k] !== "correct") combined[k] = "present";
      else if (v === "absent" && !combined[k]) combined[k] = "absent";
    }
  }

  return (
    <div className="dm2-wrap">
      <div className="dm2-header">
        <span className="dm2-title">Dordle</span>
        <span className="dm2-info">Guess {state.guesses.length + (state.status === "playing" ? 1 : 0)} / {MAX_GUESSES}</span>
      </div>
      <div className="dm2-boards">
        {state.answers.map((ans, bi) => {
          const board = buildBoard(ans, state.guesses, state.current, state.solved[bi]!);
          return (
            <div className={`dm2-board ${state.solved[bi] ? "dm2-solved" : ""}`} key={bi}>
              {board.map((row, ri) => (
                <div className="dm2-row" key={ri}>
                  {row.letters.map((ch, ci) => (
                    <div className={`dm2-tile dm2-${row.tiles[ci]}`} key={ci}>{ch.trim()}</div>
                  ))}
                </div>
              ))}
              {state.status !== "playing" && !state.solved[bi] && <div className="dm2-answer">{ans}</div>}
            </div>
          );
        })}
      </div>
      {state.message && <div className="dm2-msg">{state.message}</div>}
      <div className="dm2-keyboard">
        {KEY_ROWS.map((row, ri) => (
          <div className="dm2-krow" key={ri}>
            {ri === 2 && <button className="dm2-key dm2-wide" onClick={() => dispatch({ type: "enter" } as DordleMiniAction)}>ENTER</button>}
            {row.split("").map(ch => (
              <button key={ch} className={`dm2-key ${combined[ch] ? "dm2-k-" + combined[ch] : ""}`} onClick={() => dispatch({ type: "key", ch } as DordleMiniAction)}>{ch}</button>
            ))}
            {ri === 2 && <button className="dm2-key dm2-wide" onClick={() => dispatch({ type: "backspace" } as DordleMiniAction)}>DEL</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
