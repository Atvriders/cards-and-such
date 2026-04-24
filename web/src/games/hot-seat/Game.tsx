import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { HotSeatState, HotSeatAction, HotSeatSettings } from "./state.js";
import { isTerminal } from "./state.js";
import "./Game.css";

export function HotSeat({ state, dispatch, onGameOver }: GameProps<HotSeatState, HotSeatSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="hs-wrap">
        <div className="hs-done">
          <h2>Hot Seat Over!</h2>
          <p>You answered <strong>{state.questions.length}</strong> questions. Hope you spilled the tea!</p>
        </div>
      </div>
    );
  }

  const q = state.questions[state.currentIndex]!;

  return (
    <div className="hs-wrap">
      <div className="hs-header">
        <span>Question {state.currentIndex + 1} / {state.questions.length}</span>
      </div>
      <div className="hs-card">
        <span className="hs-seat-label">Hot Seat Question</span>
        {q}
      </div>
      <p className="hs-hint">The person in the hot seat must answer honestly. The group may follow up!</p>
      <button className="hs-next-btn" onClick={() => dispatch({ type: "next" } as HotSeatAction)}>
        {state.currentIndex + 1 >= state.questions.length ? "Finish" : "Next Question"}
      </button>
    </div>
  );
}
