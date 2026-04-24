import { useEffect, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { StoryState, StoryAction, StorySettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function StoryBuilder({ state, dispatch, onGameOver }: GameProps<StoryState, StorySettings>): JSX.Element {
  const terminal = isTerminal(state);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const modeLabel = state.settings.mode === "word" ? "one word" : "one sentence";

  if (state.phase === "done") {
    const full = state.starter + " " + state.contributions.join(" ");
    return (
      <div className="sb-wrap">
        <div className="sb-done">
          <h2>Story Complete!</h2>
          <p>{state.contributions.length} contributions — here's your story:</p>
        </div>
        <div className="sb-full-story">{full}</div>
      </div>
    );
  }

  const preview = state.starter + (state.contributions.length > 0 ? " " + state.contributions.join(" ") : "");

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: "add", text: trimmed } as StoryAction);
    setInput("");
  };

  return (
    <div className="sb-wrap">
      <div className="sb-header">
        <span>Round {state.currentRound + 1} / {state.settings.rounds}</span>
        <span>Contributions: {state.contributions.length}</span>
      </div>
      <div className="sb-story-box">
        <span className="sb-starter">{state.starter}</span>
        {state.contributions.map((c, i) => (
          <span key={i} className="sb-contribution"> {c}</span>
        ))}
      </div>
      <div className="sb-input-label">
        Pass the device — add {modeLabel} to continue the story:
      </div>
      <textarea
        className="sb-input"
        rows={3}
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={state.settings.mode === "word" ? "One word..." : "One sentence..."}
      />
      <button className="sb-add-btn" disabled={!input.trim()} onClick={handleAdd}>
        Add to Story
      </button>
      <button style={{ fontSize: "0.85rem", background: "none", border: "none", color: "#888", cursor: "pointer" }}
        onClick={() => dispatch({ type: "finish" } as StoryAction)}>
        End story early
      </button>
      <div style={{ display: "none" }}>{preview}</div>
    </div>
  );
}
