import type { GameProps } from "../../platform/game-plugin/types.js";
import type { NestorState, NestorAction, NestorSettings } from "./state.js";
import { Card as CardComponent } from "../../engines/deck/Card.js";
import "./Nestor.css";

export function Nestor({ state, dispatch, onGameOver }: GameProps<NestorState, NestorSettings>): JSX.Element {
  if (state.won || state.lost) onGameOver(state.removedPairs * 20);

  const send = (action: NestorAction) => dispatch(action);

  return (
    <div className="nestor">
      <div className="nestor-info">
        <span>Pairs removed: {state.removedPairs}/26</span>
        <span>Moves: {state.movesMade}</span>
        {state.won && <span>You win!</span>}
        {state.lost && !state.won && <span>No moves left</span>}
      </div>

      <div className="nestor-columns">
        {state.columns.map((col, cIdx) => {
          const isSelected = state.selected?.source === "column" && state.selected.index === cIdx;
          return (
            <div
              key={cIdx}
              className={`nestor-col${isSelected ? " selected-col" : ""}`}
              onClick={() => send({ type: "select-column", colIdx: cIdx })}
            >
              {col.length === 0 ? (
                <div className="nestor-placeholder">Empty</div>
              ) : (
                col.map((card, i) => (
                  <CardComponent key={card.id} card={card} className={i === col.length - 1 ? "clickable" : ""} />
                ))
              )}
            </div>
          );
        })}
      </div>

      <div className="nestor-reserve-label">Reserve</div>
      <div className="nestor-reserve">
        {state.reserve.map((card, rIdx) => {
          const isSelected = state.selected?.source === "reserve" && state.selected.index === rIdx;
          return (
            <div
              key={rIdx}
              className={`nestor-res-slot${isSelected ? " selected-col" : ""}`}
              onClick={() => card && send({ type: "select-reserve", resIdx: rIdx })}
            >
              {card ? (
                <CardComponent card={card} />
              ) : (
                <div className="nestor-placeholder">R{rIdx + 1}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
