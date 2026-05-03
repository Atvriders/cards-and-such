import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FaceRecognitionState, Face } from "./state.js";
import { isTerminal } from "./state.js";
import type { faceRecognitionSettings } from "./index.js";
import type { SettingsOf } from "../../platform/game-plugin/types.js";
import "./Game.css";

type Settings = SettingsOf<typeof faceRecognitionSettings>;

function FaceCard({ face, label }: { face: Face; label?: string }) {
  return (
    <div className="fr-face" aria-label={label}>
      <div className="fr-face-hair">{face.hair}</div>
      <div className="fr-face-skin">
        <span className="fr-face-eyes">{face.eyes}</span>
        {face.skin}
      </div>
      <div className="fr-face-extra">{face.extra}</div>
    </div>
  );
}

export function FaceRecognition({
  state,
  dispatch,
  onGameOver,
}: GameProps<FaceRecognitionState, Settings>): JSX.Element {
  const terminal = isTerminal(state);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  useEffect(() => {
    if (state.phase !== "memorize") return;
    timerRef.current = setTimeout(() => dispatch({ type: "reveal" }), state.memorizeMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [state.phase, state.round, state.memorizeMs, dispatch]);

  return (
    <div className="fr-game">
      <div className="fr-header">
        <span>Round <strong>{state.round}/10</strong></span>
        <span>Score <strong>{state.score}</strong></span>
      </div>

      {state.phase === "idle" && (
        <div className="fr-center">
          <p className="fr-desc">Memorize the face, then pick it from 4 choices!</p>
          <button data-testid="hint-target-face-recognition-primary" className="fr-btn-primary" onClick={() => dispatch({ type: "start" })}>Start</button>
        </div>
      )}

      {state.phase === "memorize" && state.target && (
        <div className="fr-center">
          <p className="fr-label">Memorize this face!</p>
          <FaceCard face={state.target} label="target face" />
          <div className="fr-timer-bar">
            <div
              className="fr-timer-fill"
              style={{ animationDuration: `${state.memorizeMs}ms` }}
            />
          </div>
        </div>
      )}

      {state.phase === "choose" && (
        <div className="fr-center">
          <p className="fr-label">Which face did you see?</p>
          <div className="fr-choices">
            {state.choices.map((face, i) => (
              <button
                key={i}
                className="fr-choice-btn"
                onClick={() => dispatch({ type: "choose", index: i })}
              >
                <FaceCard face={face} label={`choice ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>
      )}

      {state.phase === "result" && state.target && (
        <div className="fr-center">
          <div className={`fr-result ${state.lastCorrect ? "correct" : "wrong"}`}>
            {state.lastCorrect ? "Correct!" : "Wrong!"}
          </div>
          <p className="fr-label">The correct face was:</p>
          <FaceCard face={state.target} />
          <button className="fr-btn-primary" onClick={() => dispatch({ type: "next" })}>
            {state.round >= 10 ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="fr-center">
          <div className="fr-result correct">Done!</div>
          <p className="fr-desc">Final Score: <strong>{terminal?.score ?? state.score}</strong>/100</p>
          <button className="fr-btn-primary" onClick={() => dispatch({ type: "start" })}>Play Again</button>
        </div>
      )}
    </div>
  );
}
