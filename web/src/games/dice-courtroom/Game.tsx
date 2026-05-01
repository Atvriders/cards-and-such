import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DiceCourtroomState, DiceCourtroomAction, DiceCourtroomSettings } from "./state.js";
import { isTerminal, ROUNDS } from "./state.js";
import "./Game.css";

export function DiceCourtroomGame({ state, dispatch, onGameOver }: GameProps<DiceCourtroomState, DiceCourtroomSettings>): JSX.Element {
  const t = isTerminal(state);
  useEffect(() => { if (t) onGameOver(t.score); }, [t, onGameOver]);

  if (state.phase === "done") {
    return (
      <div className="cr-wrap">
        <div className="cr-done">
          <h2>{state.myEvidence >= state.oppEvidence ? "Verdict: Won" : "Verdict: Lost"}</h2>
          <div className="cr-final">{state.score} pts</div>
          <div className="cr-log">{state.log}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cr-wrap">
      <div className="cr-banner">Round {state.round} / {ROUNDS} · Score {state.score}</div>
      <div className="cr-bench">
        <div className="cr-side">
          <div className="cr-label">YOU</div>
          <div className="cr-evidence">{state.myEvidence}</div>
        </div>
        <div className="cr-vs">vs</div>
        <div className="cr-side opp">
          <div className="cr-label">PROSECUTION</div>
          <div className="cr-evidence">{state.oppEvidence}</div>
        </div>
      </div>
      {state.rolls && (
        <div className="cr-rolls">
          <div className="cr-row">
            <div className="cr-die">{state.rolls.mine[0]}</div>
            <div className="cr-die">{state.rolls.mine[1]}</div>
          </div>
          <div className="cr-vs">vs</div>
          <div className="cr-row">
            <div className="cr-die opp">{state.rolls.opp[0]}</div>
            <div className="cr-die opp">{state.rolls.opp[1]}</div>
          </div>
        </div>
      )}
      <div className="cr-log">{state.log || "Choose: present evidence, object, or give a speech."}</div>
      {state.phase === "choose" && (
        <div className="cr-actions">
          <button className="cr-btn ev" onClick={() => dispatch({ type: "play", move: "evidence" } as DiceCourtroomAction)}>Evidence</button>
          <button className="cr-btn ob" onClick={() => dispatch({ type: "play", move: "objection" } as DiceCourtroomAction)}>Objection</button>
          <button className="cr-btn sp" onClick={() => dispatch({ type: "play", move: "speech" } as DiceCourtroomAction)}>Speech</button>
        </div>
      )}
      {state.phase === "result" && (
        <button className="cr-btn next" onClick={() => dispatch({ type: "next" } as DiceCourtroomAction)}>Continue</button>
      )}
    </div>
  );
}
