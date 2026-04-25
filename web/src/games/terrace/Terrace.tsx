import { useCallback } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { TerraceState, TerraceAction, TerraceSettings } from "./state.js";
import { makeRuleset } from "./state.js";
import { Pile } from "../../engines/tableau/Pile.js";
import { useDragDrop } from "../../engines/tableau/useDragDrop.js";
import { findAutoMove } from "../../engines/tableau/index.js";
import "./Terrace.css";

const TERRACE_IDS = ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9"];
const TABLEAU_IDS = ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8", "t9"];
const FOUNDATION_IDS = ["f1", "f2", "f3", "f4"];

export function Terrace({
  state,
  dispatch,
  onGameOver,
}: GameProps<TerraceState, TerraceSettings>): JSX.Element {
  const { onDragStart, onDragOver, onDrop } = useDragDrop();
  const ruleset = makeRuleset(state.foundationStartRank);

  const handleMove = useCallback(
    (from: string, to: string, count: number) => {
      dispatch({ type: "move", fromPile: from, toPile: to, count } as TerraceAction);
    },
    [dispatch],
  );

  const handleCardClick = useCallback(
    (pileId: string, indexFromTop: number) => {
      const pile = state.piles.find((p) => p.id === pileId);
      if (!pile) return;
      const faceUpCount = pile.kind === "tableau" ? (pile.faceUpCount ?? 0) : pile.cards.length;
      const count = indexFromTop + 1;
      if (count > faceUpCount) return;
      const target = findAutoMove(state.piles, pileId, count, ruleset);
      if (target) {
        dispatch({ type: "move", fromPile: pileId, toPile: target, count } as TerraceAction);
      }
    },
    [state.piles, ruleset, dispatch],
  );

  if (state.won) onGameOver(state.score);

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;
  const wastePile = state.piles.find((p) => p.id === "waste");

  return (
    <div className="terrace">
      <div className="terrace-info">
        <span>Moves: {state.movesMade}</span>
        <span>Score: {state.score}/52</span>
        <span>Start Rank: {state.foundationStartRank}</span>
        <button
          className="auto-move-btn"
          onClick={() => dispatch({ type: "auto-move-to-foundation" } as TerraceAction)}
        >
          Auto-move
        </button>
      </div>

      {/* Terrace row */}
      <div className="terrace-row">
        {TERRACE_IDS.map((id) => (
          <div key={id} className="pile-wrapper">
            <Pile
              pile={getPile(id)}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onCardClick={handleCardClick}
            />
          </div>
        ))}
      </div>

      <div className="terrace-middle">
        {/* Foundations + stock */}
        <div className="terrace-foundations">
          {FOUNDATION_IDS.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
              />
            </div>
          ))}
          <div className="pile-wrapper">
            <Pile
              pile={getPile("stock")}
              onCardDragStart={onDragStart}
              onDrop={(pileId) => onDrop(pileId, handleMove)}
              onDragOver={onDragOver}
              onCardClick={() => dispatch({ type: "draw" } as TerraceAction)}
            />
          </div>
          {wastePile && (
            <div className="pile-wrapper">
              <Pile
                pile={wastePile}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          )}
        </div>

        {/* Tableau */}
        <div className="terrace-tableau">
          {TABLEAU_IDS.map((id) => (
            <div key={id} className="pile-wrapper">
              <Pile
                pile={getPile(id)}
                onCardDragStart={onDragStart}
                onDrop={(pileId) => onDrop(pileId, handleMove)}
                onDragOver={onDragOver}
                onCardClick={handleCardClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
