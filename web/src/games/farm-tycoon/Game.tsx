import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarmTycoonState } from "./state.js";
import { isTerminal, CROPS, TOTAL_TURNS } from "./state.js";
import type { FarmTycoonAction, CropType } from "./state.js";
import "./Game.css";

const SEASON_EMOJI: Record<string, string> = { spring: "🌱", summer: "☀️", autumn: "🍂", winter: "❄️" };
const CROP_EMOJI: Record<string, string> = { wheat: "🌾", corn: "🌽", tomato: "🍅", potato: "🥔", carrot: "🥕" };
const CROP_TYPES: CropType[] = ["wheat", "corn", "tomato", "potato", "carrot"];

export function FarmTycoon({ state, dispatch, onGameOver }: GameProps<FarmTycoonState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: FarmTycoonAction) => dispatch(a);

  return (
    <div className="farm-wrap">
      <div className="farm-header">
        <span className="farm-title">🚜 Farm Tycoon</span>
        <span>{SEASON_EMOJI[state.season]} {state.season.toUpperCase()}</span>
        <span className="farm-turn">Turn {state.turn}/{TOTAL_TURNS}</span>
        <span className="farm-cash">${state.cash}</span>
      </div>

      {state.phase === "plant" && (
        <>
          <div className="farm-fields">
            {state.fields.map((field, i) => (
              <div key={i} className="farm-field">
                <div className="farm-field-label">Field {i + 1}</div>
                {field && !field.grown ? (
                  <div className="farm-growing">{CROP_EMOJI[field.type]} Growing ({CROPS[field.type].growTurns - field.turnsPlanted - 1} turns left)</div>
                ) : (
                  <div className="farm-crop-btns">
                    {CROP_TYPES.map(crop => (
                      <button key={crop} className="farm-crop-btn"
                        disabled={state.cash < CROPS[crop].cost}
                        onClick={() => d({ type: "plantField", fieldIndex: i, crop })}>
                        {CROP_EMOJI[crop]} {CROPS[crop].label} (${CROPS[crop].cost})
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button className="farm-btn" onClick={() => d({ type: "harvest" })}>Advance Turn &amp; Harvest</button>
        </>
      )}

      {state.phase === "results" && (
        <div className="farm-results">
          <div className="farm-result-row">Harvested this turn: <strong>${state.lastHarvest}</strong></div>
          <button className="farm-btn" onClick={() => d({ type: "nextTurn" })}>
            {state.turn >= TOTAL_TURNS ? "See Final Score" : "Next Turn →"}
          </button>
        </div>
      )}

      {state.phase === "done" && (
        <div className="farm-done">
          <div className="farm-final">Final Cash: <strong>${state.cash}</strong></div>
          <div className="farm-score">
            {state.cash >= 2000 ? "🏆 Master Farmer!" : state.cash >= 1000 ? "👍 Good Harvest!" : "🌱 Keep Practicing!"}
          </div>
        </div>
      )}

      {state.log.length > 0 && (
        <div className="farm-log">
          {[...state.log].reverse().slice(0, 8).map((l, i) => <div key={i} className="farm-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
