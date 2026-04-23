import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GuessWhoState, GuessWhoSettings } from "./state.js";
import type { GuessWhoAction } from "./state.js";
import { isTerminal, CHARACTERS, QUESTIONS } from "./state.js";
import "./Game.css";

export function GuessWhoGame({ state, dispatch, onGameOver }: GameProps<GuessWhoState, GuessWhoSettings>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);

  const [mode, setMode] = useState<"ask" | "guess">("ask");
  const canPlay = state.phase === "asking";

  const remaining = CHARACTERS.filter((c) => !state.playerEliminated[c.id]);

  return (
    <div className="gw-game">
      <div className={`gw-status ${state.phase === "win" ? "win" : state.phase === "loss" ? "loss" : ""}`}>
        {state.message}
      </div>

      <div className="gw-meta">
        <span>Remaining: <strong>{remaining.length}</strong></span>
        <span>Questions asked: <strong>{state.questionsAsked}</strong></span>
      </div>

      {state.lastQuestion && (
        <div className="gw-last-q">
          <span>Last Q: {state.lastQuestion.text}</span>
          <span className={`gw-answer ${state.lastAnswer ? "yes" : "no"}`}>{state.lastAnswer ? "YES" : "NO"}</span>
        </div>
      )}

      {canPlay && (
        <div className="gw-mode-tabs">
          <button className={`gw-tab ${mode === "ask" ? "active" : ""}`} onClick={() => setMode("ask")}>Ask Question</button>
          <button className={`gw-tab ${mode === "guess" ? "active" : ""}`} onClick={() => setMode("guess")}>Make Guess</button>
        </div>
      )}

      {canPlay && mode === "ask" && (
        <div className="gw-questions">
          {QUESTIONS.map((q, i) => (
            <button
              key={i}
              className="gw-q-btn"
              onClick={() => dispatch({ type: "ask", questionIdx: i } satisfies GuessWhoAction)}
            >
              {q.text}
            </button>
          ))}
        </div>
      )}

      {canPlay && mode === "guess" && (
        <div className="gw-guess-grid">
          {CHARACTERS.map((c) => (
            <button
              key={c.id}
              className={`gw-char-btn ${state.playerEliminated[c.id] ? "eliminated" : ""}`}
              onClick={() => dispatch({ type: "guess", charId: c.id } satisfies GuessWhoAction)}
              disabled={state.playerEliminated[c.id]}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="gw-board">
        <div className="gw-board-title">Character Board</div>
        <div className="gw-char-grid">
          {CHARACTERS.map((c) => (
            <div key={c.id} className={`gw-char-card ${state.playerEliminated[c.id] ? "elim" : ""}`}>
              <div className="gw-char-name">{c.name}</div>
              <div className="gw-char-attr">{c.hair} · {c.eyes}</div>
              <div className="gw-char-attr">{c.facialHair !== "none" ? c.facialHair : ""} {c.accessory !== "none" ? c.accessory : ""}</div>
              <div className="gw-char-attr">{c.hairLength} · {c.nose} nose</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
