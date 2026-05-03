import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { RgbMixerState, RgbMixerSettings } from "./state.js";
import { isTerminal, colorDistance } from "./state.js";
import "./RgbMixer.css";

export function RgbMixer({
  state,
  dispatch,
  onGameOver,
}: GameProps<RgbMixerState, RgbMixerSettings>): JSX.Element {
  const terminal = isTerminal(state);

  useEffect(() => {
    if (terminal) onGameOver(terminal.score);
  }, [terminal, onGameOver]);

  const targetColor = `rgb(${state.targetR},${state.targetG},${state.targetB})`;
  const guessColor = `rgb(${state.r},${state.g},${state.b})`;
  const dist = colorDistance(state);
  const lastRoundPts = state.roundScores[state.roundScores.length - 1];

  return (
    <div className="rgb-game">
      <div className="rgb-title">RGB Mixer</div>
      <div className="rgb-score">
        Round {state.currentRound + 1}/{state.totalRounds} — Score: {state.score}
      </div>

      <div className="rgb-swatches">
        <div className="rgb-swatch-block">
          <div className="rgb-swatch" style={{ backgroundColor: targetColor }} />
          <div className="rgb-swatch-label">Target</div>
        </div>
        <div style={{ fontSize: "1.5rem" }}>vs</div>
        <div className="rgb-swatch-block">
          <div className="rgb-swatch" style={{ backgroundColor: guessColor }} />
          <div className="rgb-swatch-label">Your Mix</div>
        </div>
      </div>

      {!state.gameOver && (
        <>
          {!state.locked && (
            <>
              <div className="rgb-sliders">
                <div className="rgb-slider-row">
                  <span className="rgb-slider-label r">R</span>
                  <input type="range" min={0} max={255} value={state.r}
                    onChange={e => dispatch({ type: "setR", value: Number(e.target.value) })} />
                  <span className="rgb-slider-val">{state.r}</span>
                </div>
                <div className="rgb-slider-row">
                  <span className="rgb-slider-label g">G</span>
                  <input type="range" min={0} max={255} value={state.g}
                    onChange={e => dispatch({ type: "setG", value: Number(e.target.value) })} />
                  <span className="rgb-slider-val">{state.g}</span>
                </div>
                <div className="rgb-slider-row">
                  <span className="rgb-slider-label b">B</span>
                  <input type="range" min={0} max={255} value={state.b}
                    onChange={e => dispatch({ type: "setB", value: Number(e.target.value) })} />
                  <span className="rgb-slider-val">{state.b}</span>
                </div>
              </div>
              <button data-testid="hint-target-rgb-mixer-action" className="rgb-submit-btn" onClick={() => dispatch({ type: "submit" })}>
                Lock In
              </button>
            </>
          )}

          {state.locked && (
            <>
              <div className="rgb-round-pts">
                +{lastRoundPts} pts — distance: {dist}
              </div>
              <div className="rgb-dist">
                Target: rgb({state.targetR},{state.targetG},{state.targetB})
              </div>
              <button className="rgb-submit-btn" onClick={() => dispatch({ type: "submit" })}>
                Next Round
              </button>
            </>
          )}
        </>
      )}

      {state.gameOver && (
        <div className="rgb-game-over">
          Game Over! Final Score: {state.score}<br />
          <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>
            Max: {state.totalRounds * 1000}
          </span>
        </div>
      )}
    </div>
  );
}
