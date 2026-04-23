import { useState, useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { GizaState, GizaAction, GizaSettings } from "./state.js";
import { isAccessible } from "./state.js";
import { rankLabel, isRed } from "../../engines/deck/index.js";
import type { Card } from "../../engines/deck/index.js";
import "./Game.css";

type Coord = { py: number; row: number; col: number };

function CardEl({
  card,
  accessible,
  selected,
  onClick,
}: {
  card: Card | null;
  accessible: boolean;
  selected: boolean;
  onClick?: () => void;
}) {
  if (!card) return <div className="giza-empty-slot" />;
  const red = isRed(card.suit);
  return (
    <div
      className={`giza-card${red ? " red" : ""}${accessible ? " accessible" : " blocked"}${selected ? " selected" : ""}${accessible && onClick ? " clickable" : ""}`}
      onClick={accessible && onClick ? onClick : undefined}
    >
      <span>{rankLabel(card.rank)}</span>
      <span>{card.suit}</span>
    </div>
  );
}

export function Game({
  state,
  dispatch,
  onGameOver,
}: GameProps<GizaState, GizaSettings>): JSX.Element {
  const [selected, setSelected] = useState<Coord | null>(null);

  const handleCardClick = useCallback(
    (coord: Coord) => {
      if (!selected) {
        setSelected(coord);
        return;
      }
      if (selected.py === coord.py && selected.row === coord.row && selected.col === coord.col) {
        setSelected(null);
        return;
      }
      // Try to send to foundation first
      const c1 = state.pyramids[coord.py]![coord.row]![coord.col];
      if (c1) {
        // Try pair removal
        dispatch({ type: "remove-pair", card1: selected, card2: coord } as GizaAction);
      }
      setSelected(null);
    },
    [selected, dispatch, state.pyramids],
  );

  if (state.won) onGameOver(state.score);

  const SUIT_SYMBOLS = ["♠", "♥", "♦", "♣"] as const;

  return (
    <div className="giza">
      <div className="giza-info">
        <span>Stock: {state.stock.length}</span>
        <span>Score: {state.score}</span>
        <span>Moves: {state.movesMade}</span>
        {selected && <span className="giza-selecting">Select a second card (sum=13) or click again to deselect</span>}
      </div>

      <div className="giza-pyramids">
        {state.pyramids.map((pyramid, pyIdx) => (
          <div key={pyIdx} className="giza-pyramid">
            {pyramid.map((row, rowIdx) => (
              <div key={rowIdx} className="giza-row">
                {row.map((card, colIdx) => {
                  const coord: Coord = { py: pyIdx, row: rowIdx, col: colIdx };
                  const accessible = isAccessible(state.pyramids, pyIdx, rowIdx, colIdx);
                  const isSelected = selected?.py === pyIdx && selected?.row === rowIdx && selected?.col === colIdx;
                  return (
                    <CardEl
                      key={colIdx}
                      card={card}
                      accessible={accessible}
                      selected={isSelected}
                      onClick={() => {
                        if (accessible) {
                          // Try foundation first
                          dispatch({ type: "remove-to-foundation", py: pyIdx, row: rowIdx, col: colIdx } as GizaAction);
                          if (selected) handleCardClick(coord);
                          else handleCardClick(coord);
                        }
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="giza-bottom">
        {/* Stock */}
        <div
          className={`giza-stock${state.stock.length > 0 ? " clickable" : " empty"}`}
          onClick={() => dispatch({ type: "draw-stock" } as GizaAction)}
        >
          <div className="giza-stock-back">{state.stock.length > 0 ? state.stock.length : "–"}</div>
        </div>

        {/* Foundations */}
        <div className="giza-foundations">
          {state.foundations.map((pile, i) => (
            <div key={i} className="giza-foundation">
              {pile.length > 0 ? (
                <CardEl
                  card={pile[pile.length - 1]!}
                  accessible={true}
                  selected={false}
                />
              ) : (
                <div className="giza-foundation-empty">{SUIT_SYMBOLS[i]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
