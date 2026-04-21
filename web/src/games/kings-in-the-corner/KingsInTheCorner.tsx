import { useState, useCallback, useEffect } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { KingsInTheCornerState, KingsInTheCornerAction, KitCPile } from "./state.js";
import { getLegalPlays } from "./state.js";
import { Card } from "../../engines/deck/Card.js";
import { rankLabel } from "../../engines/deck/index.js";
import "./KingsInTheCorner.css";

type KitCCard = KitCPile["cards"][number];

export function KingsInTheCorner({
  state,
  dispatch,
  onGameOver,
}: GameProps<KingsInTheCornerState, Record<string, never>>): JSX.Element {
  const [selectedCard, setSelectedCard] = useState<{ pileId: string; cardIdx: number } | null>(null);

  if (state.won) onGameOver(state.score);

  // Auto-trigger bot turns
  useEffect(() => {
    if (state.currentPlayer !== 0 && !state.won) {
      const t = setTimeout(() => {
        dispatch({ type: "bot-turn" } as KingsInTheCornerAction);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [state.currentPlayer, state.won, dispatch]);

  const legalPlays = getLegalPlays(state);
  const isMyTurn = state.currentPlayer === 0;

  const legalTargets = selectedCard
    ? new Set(
        legalPlays
          .filter((p) => p.fromPile === selectedCard.pileId)
          .map((p) => p.toPile),
      )
    : new Set<string>();

  const legalFromHand = new Set(
    legalPlays
      .filter((p) => p.fromPile === "h0")
      .map((p) => p.toPile),
  );

  const getPile = (id: string) => state.piles.find((p) => p.id === id)!;

  const handlePileClick = useCallback(
    (pileId: string) => {
      if (!isMyTurn) return;
      if (selectedCard) {
        if (legalTargets.has(pileId)) {
          dispatch({ type: "play", fromPile: selectedCard.pileId, toPile: pileId } as KingsInTheCornerAction);
          setSelectedCard(null);
        } else {
          setSelectedCard(null);
        }
      } else {
        // Select this pile to move
        const pile = getPile(pileId);
        if (pile && pile.cards.length > 0 && (pile.kind === "tableau" || pile.kind === "corner")) {
          const hasLegal = legalPlays.some((p) => p.fromPile === pileId);
          if (hasLegal) setSelectedCard({ pileId, cardIdx: 0 });
        }
      }
    },
    [isMyTurn, selectedCard, legalTargets, legalPlays, dispatch, getPile],
  );

  const handleHandCardClick = useCallback(
    (cardIdx: number) => {
      if (!isMyTurn) return;
      const card = getPile("h0").cards[cardIdx];
      if (!card) return;
      if (selectedCard?.pileId === "h0" && selectedCard.cardIdx === cardIdx) {
        setSelectedCard(null);
        return;
      }
      setSelectedCard({ pileId: "h0", cardIdx });
    },
    [isMyTurn, selectedCard, getPile],
  );

  const renderBoardPile = (id: string, label: string) => {
    const pile = getPile(id);
    const isTarget = legalTargets.has(id);
    const topCard = pile.cards.length > 0 ? pile.cards[pile.cards.length - 1] : undefined;
    return (
      <div className="kitc-cell" key={id}>
        <div>
          <div className="kitc-label">{label}</div>
          <div
            className={`kitc-pile${isTarget ? " legal-target" : ""}`}
            onClick={() => handlePileClick(id)}
            style={isTarget ? { borderColor: "#4f4" } : {}}
          >
            {topCard ? (
              <Card card={topCard} faceDown={false} />
            ) : (
              <span style={{ color: "#555", fontSize: 11 }}>{id.startsWith("c") ? "King" : "empty"}</span>
            )}
            {pile.cards.length > 1 && (
              <div className="kitc-pile-count">×{pile.cards.length}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const hand0 = getPile("h0");
  const stock = getPile("stock");

  return (
    <div className="kitc">
      <div className="kitc-info">
        <span className="kitc-turn-indicator">
          {isMyTurn ? "Your turn" : `Bot ${state.currentPlayer} thinking…`}
        </span>
        <span>Moves: {state.movesMade}</span>
        <span>Stock: {stock.cards.length}</span>
      </div>

      <div className="kitc-opponents">
        {[1, 2, 3].map((p) => (
          <div key={p} className="kitc-opp">
            Bot {p}: {getPile(`h${p}`).cards.length} cards
          </div>
        ))}
      </div>

      {/* Board: 3×5 grid — corners, tableau, stock in center */}
      <div className="kitc-board">
        {/* Row 0 */}
        {renderBoardPile("cNW", "NW")}
        <div className="kitc-cell" />
        {renderBoardPile("tN", "N")}
        <div className="kitc-cell" />
        {renderBoardPile("cNE", "NE")}
        {/* Row 1 */}
        {renderBoardPile("tW", "W")}
        <div className="kitc-cell">
          <div className="kitc-pile" onClick={() => { if (isMyTurn && !state.drawnThisTurn) dispatch({ type: "draw" } as KingsInTheCornerAction); }}>
            {stock.cards.length > 0 ? (
              <Card faceDown={true} />
            ) : (
              <span style={{ color: "#555", fontSize: 11 }}>empty</span>
            )}
            <div className="kitc-pile-count">{stock.cards.length}</div>
          </div>
        </div>
        {renderBoardPile("tE", "E")}
        {/* Row 2 */}
        {renderBoardPile("cSW", "SW")}
        <div className="kitc-cell" />
        {renderBoardPile("tS", "S")}
        <div className="kitc-cell" />
        {renderBoardPile("cSE", "SE")}
      </div>

      <div>
        <div className="kitc-hand-label">Your hand ({hand0.cards.length} cards):</div>
        <div className="kitc-hand">
          {hand0.cards.map((card: KitCCard, i: number) => {
            const isSelected = selectedCard?.pileId === "h0" && selectedCard.cardIdx === i;
            const isLegal = isMyTurn && legalFromHand.size > 0;
            return (
              <div
                key={card.id}
                className={`kitc-hand-card${isSelected ? " selected" : ""}${isLegal ? " legal" : ""}`}
                onClick={() => handleHandCardClick(i)}
              >
                <Card card={card} faceDown={false} />
              </div>
            );
          })}
        </div>
      </div>

      <div className="kitc-actions">
        <button
          className="kitc-btn"
          disabled={!isMyTurn || state.drawnThisTurn}
          onClick={() => dispatch({ type: "draw" } as KingsInTheCornerAction)}
        >
          Draw
        </button>
        <button
          className="kitc-btn"
          disabled={!isMyTurn || !state.drawnThisTurn}
          onClick={() => {
            setSelectedCard(null);
            dispatch({ type: "end-turn" } as KingsInTheCornerAction);
          }}
        >
          End Turn
        </button>
      </div>
      <div style={{ fontSize: 12, color: "#777" }}>
        {isMyTurn && !state.drawnThisTurn && "Draw a card to start your turn."}
        {isMyTurn && state.drawnThisTurn && legalPlays.length === 0 && "No legal plays — end your turn."}
        {isMyTurn && state.drawnThisTurn && legalPlays.length > 0 && `${legalPlays.length} legal play(s) available. Click a hand card or tableau pile, then click a destination.`}
      </div>
    </div>
  );
}

// Suppress unused rankLabel
void rankLabel;
