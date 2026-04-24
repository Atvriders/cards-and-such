import { useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { FarmState, Crop } from "./state.js";
import { isTerminal, CROP_COSTS, CROP_PRICES, TOTAL_SEASONS } from "./state.js";
import type { FarmAction } from "./state.js";
import "./Game.css";

const CROP_EMOJI: Record<Crop, string> = { wheat: "🌾", corn: "🌽", tomato: "🍅" };
const EVENT_EMOJI: Record<string, string> = { normal: "☁️", drought: "🏜️", flood: "🌊", bumper: "🌟" };
const EVENT_LABEL: Record<string, string> = { normal: "Normal", drought: "Drought! Low yields", flood: "Flood! Very low yields", bumper: "Bumper crop! Great yields" };
const CROPS: Crop[] = ["wheat", "corn", "tomato"];

export function FarmManager({
  state,
  dispatch,
  onGameOver,
}: GameProps<FarmState, Record<string, never>>): JSX.Element {
  const terminal = isTerminal(state);
  useEffect(() => { if (terminal) onGameOver(terminal.score); }, [terminal, onGameOver]);
  const d = (a: FarmAction) => dispatch(a);

  return (
    <div className="farm-wrap">
      <div className="farm-header">
        <span>🌱 Farm Manager</span>
        <span>Season {state.season}/{TOTAL_SEASONS}</span>
        <span>💰 ${state.money}</span>
      </div>

      {state.phase === "planting" && (
        <>
          <div className="farm-hint">Click a field to plant. Then end planting to see weather.</div>
          <div className="farm-fields">
            {state.fields.map((f, i) => (
              <div key={i} className={`farm-field ${f.planted ? "planted" : "empty"}`}>
                {f.planted && f.crop ? (
                  <span>{CROP_EMOJI[f.crop]} {f.crop}</span>
                ) : (
                  <div className="farm-plant-btns">
                    {CROPS.map(c => (
                      <button key={c} className="farm-crop-btn" onClick={() => d({ type: "plant", field: i, crop: c })}>
                        {CROP_EMOJI[c]} ${CROP_COSTS[c]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="farm-crop-legend">
            {CROPS.map(c => <span key={c}>{CROP_EMOJI[c]} {c}: cost ${CROP_COSTS[c]}, sells ${ CROP_PRICES[c] }/bushel</span>)}
          </div>
          <button className="farm-btn" onClick={() => d({ type: "endPlanting" })}>End Planting →</button>
        </>
      )}

      {state.phase === "harvest" && (
        <>
          <div className="farm-event">{EVENT_EMOJI[state.event]} <strong>{EVENT_LABEL[state.event]}</strong></div>
          <div className="farm-fields">
            {state.fields.map((f, i) => (
              <div key={i} className={`farm-field ${f.planted ? "planted" : "empty"}`}>
                {f.planted && f.crop ? <span>{CROP_EMOJI[f.crop]} {f.crop}</span> : <span className="farm-fallow">Fallow</span>}
              </div>
            ))}
          </div>
          <button className="farm-btn" onClick={() => d({ type: "harvest" })}>Harvest! 🚜</button>
        </>
      )}

      {state.phase === "growing" && (
        <>
          <div className="farm-results">
            <div>Harvest: {state.harvest} bushels</div>
            <div className={`farm-profit ${state.lastProfit >= 0 ? "pos" : "neg"}`}>
              Profit: {state.lastProfit >= 0 ? "+" : ""}${state.lastProfit}
            </div>
          </div>
          <button className="farm-btn" onClick={() => d({ type: "nextSeason" })}>
            {state.season >= TOTAL_SEASONS ? "See Final Score" : "Next Season →"}
          </button>
        </>
      )}

      {state.phase === "done" && (
        <div className="farm-done">
          Final money: <strong>${state.money}</strong>
          {state.money >= 200 ? " 🏆 Great farmer!" : " 🌱 Keep practicing"}
        </div>
      )}

      {state.log.length > 0 && (
        <div className="farm-log">
          {[...state.log].reverse().map((l, i) => <div key={i} className="farm-log-line">{l}</div>)}
        </div>
      )}
    </div>
  );
}
