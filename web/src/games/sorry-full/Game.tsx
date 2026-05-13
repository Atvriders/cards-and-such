import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { SorryFullState, SorryFullAction, SorryFullCard, SorryFullSettings } from "./state.js";
import { isTerminal, HOME_POS, YARD, SAFETY_START, _internals, cardLabel, LABELS } from "./state.js";
import "./Game.css";

const COLORS = ["red", "blue", "yellow", "green"];

function cardDesc(card: SorryFullCard): string {
  if (card === "Sorry") return "Place a yard pawn on any opponent and send them home.";
  if (card === 1) return "Leave Start, or move 1.";
  if (card === 2) return "Leave Start, or move 2. Draw again.";
  if (card === 4) return "Move back 4 spaces.";
  if (card === 7) return "Move 7, or split 7 between two pawns.";
  if (card === 10) return "Move 10 forward, or 1 backward.";
  if (card === 11) return "Move 11 forward, or swap with an opponent on the ring.";
  return `Move ${card} spaces forward.`;
}

function posLabel(pos: number): string {
  if (pos === YARD) return "Yard";
  if (pos === HOME_POS) return "Home";
  if (pos >= SAFETY_START) return `Safety ${pos - SAFETY_START + 1}`;
  return `Ring ${pos}`;
}

interface PawnProps {
  player: number;
  pawnIdx: number;
  pos: number;
  highlighted?: boolean;
}

function PawnTok({ player, pawnIdx, pos, highlighted }: PawnProps): JSX.Element {
  const cls = `sf-pawn color-${COLORS[player]} ${pos === HOME_POS ? "finished" : ""} ${highlighted ? "hl" : ""}`;
  return (
    <span className={cls} title={`${LABELS[player]} pawn ${pawnIdx + 1} — ${posLabel(pos)}`}>
      {pos === YARD ? "Y" : pos === HOME_POS ? "H" : pawnIdx + 1}
    </span>
  );
}

export function SorryFull({
  state,
  dispatch,
  onGameOver,
}: GameProps<SorryFullState, SorryFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const isMyTurn = state.turn === 0 && state.winner === null && state.winningTeam === null;
  const canDraw = isMyTurn && state.phase === "drawing";
  const choosing = isMyTurn && state.phase === "choosing";
  const splitting = isMyTurn && state.phase === "splitting";

  // Track which pawn the player has selected for swap (11) or for sorry placement.
  const [selectedPawn, setSelectedPawn] = useState<number | null>(null);
  useEffect(() => { setSelectedPawn(null); }, [state.currentCard, state.phase, state.turn]);

  // Helper for forward delta of current card with alt
  function deltaFor(card: SorryFullCard, alt: boolean): number | null {
    return _internals.deltaForCard(card, alt);
  }

  function canMovePawnWithCard(pi: number, card: SorryFullCard, alt = false): boolean {
    const pos = state.pawns[0]![pi]!;
    if (card === 1 || card === 2) {
      if (pos === YARD) return _internals.tryLeaveYard(state.pawns, 0, pi) !== null;
      return _internals.tryMove(state.pawns, 0, pi, card) !== null;
    }
    if (card === 7) {
      return _internals.tryMove(state.pawns, 0, pi, 7) !== null;
    }
    if (card === 10) {
      const d = alt ? -1 : 10;
      return _internals.tryMove(state.pawns, 0, pi, d) !== null;
    }
    if (card === 11) {
      // 11 move-forward option
      return _internals.tryMove(state.pawns, 0, pi, 11) !== null;
    }
    if (card === "Sorry") return false; // Sorry is a placement, not a move
    const d = deltaFor(card, alt);
    if (d === null) return false;
    return _internals.tryMove(state.pawns, 0, pi, d) !== null;
  }

  function canSplitWith(pi: number, n: number): boolean {
    if (n < 1 || n > 6) return false;
    return _internals.tryMove(state.pawns, 0, pi, n) !== null;
  }

  let status = "";
  if (state.winningTeam !== null) status = state.winningTeam === 0 ? "Your team wins!" : "Other team wins.";
  else if (state.winner === 0) status = "You win!";
  else if (state.winner !== null) status = `${LABELS[state.winner]} wins!`;
  else if (!isMyTurn) status = `${LABELS[state.turn]} is playing…`;
  else if (canDraw) status = "Draw a card to start your turn.";
  else if (splitting) status = `Split 7: ${state.splitRemaining} space${state.splitRemaining === 1 ? "" : "s"} left — pick a different pawn.`;
  else if (state.currentCard !== null) status = `Card ${cardLabel(state.currentCard)} — ${cardDesc(state.currentCard)}`;

  const card = state.currentCard;

  // For 11-swap and Sorry placement we need a two-step selection.
  const needsSelfPick = choosing && (card === 11 || card === "Sorry");

  const showSplitButtons = choosing && card === 7;
  const showAltFor10 = choosing && card === 10;

  // No-legal-move state when player drew but UI shouldn't get stuck (the reducer
  // auto-passes on draw, so this is rare). However for splits we may want skip.
  const showSkipForSplit = splitting && state.splitRemaining > 0;

  // Helpers
  function tryDispatch(a: SorryFullAction): void { dispatch(a); }

  const myPawnsOnRingOrSafety = useMemo(() => {
    return state.pawns[0]!
      .map((p, i) => ({ i, pos: p }))
      .filter((x) => x.pos !== YARD && x.pos !== HOME_POS);
  }, [state.pawns]);

  return (
    <div className="sf-game fade-in">
      <div className={`sf-status pulse ${state.winner === 0 || state.winningTeam === 0 ? "win" : (state.winner !== null || state.winningTeam !== null) ? "loss" : ""}`}>
        {status}
      </div>

      <div className="sf-card-area" data-testid="sf-card-area">
        {card !== null && (
          <div className={`sf-card ${typeof card === "number" ? `n${card}` : "sorry"}`}>
            <span className="sf-card-val">{cardLabel(card)}</span>
          </div>
        )}
        {canDraw && (
          <button
            className="sf-draw-btn"
            data-testid="sf-draw"
            onClick={() => tryDispatch({ type: "draw" })}
            title="Draw the top card from the deck and play it."
          >
            Draw Card
          </button>
        )}
        {showSkipForSplit && (
          <button
            className="sf-skip-btn"
            data-testid="sf-action"
            onClick={() => tryDispatch({ type: "skip" })}
            title="Forfeit the rest of your 7-split (legal if no pawn can use the remainder)."
          >
            Skip remaining {state.splitRemaining}
          </button>
        )}
      </div>

      {/* Players panels */}
      <div className="sf-players">
        {state.pawns.map((pawnRow, pi) => {
          const isActive = state.turn === pi && state.winner === null && state.winningTeam === null;
          const team = pi % 2 === 0 ? "A" : "B";
          return (
            <div key={pi} className={`sf-player color-${COLORS[pi]} ${isActive ? "active" : ""}`}>
              <div className="sf-player-head">
                <span className="sf-player-name">{LABELS[pi]}</span>
                {state.settings.mode === "partners" && (
                  <span className="sf-team-tag" title={`Team ${team}`}>Team {team}</span>
                )}
              </div>
              <div className="sf-pawn-row">
                {pawnRow.map((pos, pawnIdx) => {
                  const mine = pi === 0;
                  // Determine button affordance
                  let primaryButton: JSX.Element | null = null;
                  let altButton: JSX.Element | null = null;
                  let splitButtons: JSX.Element | null = null;
                  let highlighted = false;

                  if (mine && card !== null && choosing) {
                    if (card === "Sorry") {
                      // Pick a yard pawn to "send" to an opponent. Click yard pawn → selectedPawn.
                      if (pos === YARD) {
                        primaryButton = (
                          <button
                            className={`sf-act-btn select ${selectedPawn === pawnIdx ? "sel" : ""}`}
                            data-testid={selectedPawn === null ? "sf-action" : undefined}
                            onClick={() => setSelectedPawn(pawnIdx)}
                            title="Select this yard pawn to send to an opponent."
                          >
                            {selectedPawn === pawnIdx ? "Selected" : "Choose"}
                          </button>
                        );
                        if (selectedPawn === pawnIdx) highlighted = true;
                      }
                    } else if (card === 11) {
                      // Need to pick which of my ring pawns first (only for the swap option)
                      // Also offer "Move 11" directly per pawn if legal.
                      if (canMovePawnWithCard(pawnIdx, 11)) {
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx })}
                            title="Move this pawn 11 spaces forward."
                          >
                            Move 11
                          </button>
                        );
                      }
                      if (pos >= 0 && pos < SAFETY_START) {
                        // Eligible to act as swap source
                        altButton = (
                          <button
                            className={`sf-act-btn alt ${selectedPawn === pawnIdx ? "sel" : ""}`}
                            onClick={() => setSelectedPawn(pawnIdx)}
                            title="Select this pawn to swap with an opponent on the ring."
                          >
                            {selectedPawn === pawnIdx ? "Swap?" : "Swap"}
                          </button>
                        );
                        if (selectedPawn === pawnIdx) highlighted = true;
                      }
                    } else if (card === 10) {
                      if (canMovePawnWithCard(pawnIdx, 10, false)) {
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx, alt: false })}
                            title="Move 10 spaces forward."
                          >
                            +10
                          </button>
                        );
                      }
                      if (canMovePawnWithCard(pawnIdx, 10, true)) {
                        altButton = (
                          <button
                            className="sf-act-btn alt"
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx, alt: true })}
                            title="Move 1 space backward (alternate use of 10)."
                          >
                            -1
                          </button>
                        );
                      }
                    } else if (card === 7) {
                      if (canMovePawnWithCard(pawnIdx, 7)) {
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx })}
                            title="Move this pawn 7 spaces forward."
                          >
                            Move 7
                          </button>
                        );
                      }
                      // Split options: render numbered buttons 1..6 if that move is legal
                      const opts: JSX.Element[] = [];
                      for (let n = 1; n <= 6; n++) {
                        if (canSplitWith(pawnIdx, n)) {
                          opts.push(
                            <button
                              key={n}
                              className="sf-split-btn"
                              onClick={() => tryDispatch({ type: "split", pawn: pawnIdx, spaces: n })}
                              title={`Use ${n} of your 7 on this pawn (remainder goes to another pawn).`}
                            >
                              +{n}
                            </button>,
                          );
                        }
                      }
                      if (opts.length > 0) {
                        splitButtons = <div className="sf-split-row">{opts}</div>;
                      }
                    } else if (card === 1 || card === 2) {
                      if (canMovePawnWithCard(pawnIdx, card)) {
                        const label = pos === YARD ? "Start" : `+${card}`;
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx })}
                            title={pos === YARD ? "Bring this pawn out of Start." : `Move ${card} forward.`}
                          >
                            {label}
                          </button>
                        );
                      }
                    } else if (card === 4) {
                      if (canMovePawnWithCard(pawnIdx, 4)) {
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx })}
                            title="Move 4 spaces backward."
                          >
                            -4
                          </button>
                        );
                      }
                    } else if (typeof card === "number") {
                      if (canMovePawnWithCard(pawnIdx, card)) {
                        primaryButton = (
                          <button
                            className="sf-act-btn"
                            data-testid={primaryButton ? undefined : "sf-action"}
                            onClick={() => tryDispatch({ type: "move", pawn: pawnIdx })}
                            title={`Move ${card} spaces forward.`}
                          >
                            +{card}
                          </button>
                        );
                      }
                    }
                  } else if (mine && card === 7 && splitting) {
                    // 7-split second-pawn: must take exactly splitRemaining
                    if (pawnIdx !== state.splitPawn && canSplitWith(pawnIdx, state.splitRemaining)) {
                      primaryButton = (
                        <button
                          className="sf-act-btn"
                          data-testid="sf-action"
                          onClick={() => tryDispatch({ type: "split", pawn: pawnIdx, spaces: state.splitRemaining })}
                          title={`Move this pawn ${state.splitRemaining} space(s) to complete the 7-split.`}
                        >
                          +{state.splitRemaining}
                        </button>
                      );
                    }
                  }

                  // Opponent targeting for Sorry / Swap
                  let opponentBtn: JSX.Element | null = null;
                  if (!mine && choosing && card === "Sorry" && selectedPawn !== null) {
                    const team0 = state.settings.mode === "partners";
                    const oppOk = !team0 || (pi % 2 !== 0);
                    if (oppOk && pos >= 0 && pos < SAFETY_START) {
                      opponentBtn = (
                        <button
                          className="sf-act-btn target"
                          onClick={() => tryDispatch({ type: "sorry", targetPlayer: pi, targetPawn: pawnIdx, myPawn: selectedPawn })}
                          title={`Send ${LABELS[pi]} pawn ${pawnIdx + 1} back to their yard and take its place.`}
                        >
                          Sorry!
                        </button>
                      );
                    }
                  }
                  if (!mine && choosing && card === 11 && selectedPawn !== null) {
                    const team0 = state.settings.mode === "partners";
                    const oppOk = !team0 || (pi % 2 !== 0);
                    if (oppOk && pos >= 0 && pos < SAFETY_START) {
                      opponentBtn = (
                        <button
                          className="sf-act-btn target"
                          onClick={() => tryDispatch({ type: "swap", myPawn: selectedPawn, targetPlayer: pi, targetPawn: pawnIdx })}
                          title={`Swap places with ${LABELS[pi]} pawn ${pawnIdx + 1}.`}
                        >
                          Swap here
                        </button>
                      );
                    }
                  }

                  return (
                    <div key={pawnIdx} className="sf-pawn-cell">
                      <PawnTok player={pi} pawnIdx={pawnIdx} pos={pos} highlighted={highlighted} />
                      <span className="sf-pawn-loc">{posLabel(pos)}</span>
                      <span className="sf-pawn-acts">
                        {primaryButton}
                        {altButton}
                        {opponentBtn}
                      </span>
                      {splitButtons}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {needsSelfPick && selectedPawn === null && (
        <div className="sf-hint">
          {card === "Sorry"
            ? "Pick one of your yard pawns to place onto an opponent."
            : "Pick one of your ring pawns to swap, then click an opponent's pawn."}
        </div>
      )}

      <div className="sf-deck-info">
        Deck: {state.deck.length} • Discard: {state.discard.length} • Mode: {state.settings.mode}
      </div>

      <div className="sf-log">
        {state.log.slice(-5).map((entry, i) => (
          <div key={`${state.log.length}-${i}`} className="sf-log-entry">{entry}</div>
        ))}
      </div>

      {terminal !== null && (
        <div className="sf-end bounce-in">
          <div className="sf-end-title">
            {terminal.score > 0 ? "Victory!" : "Defeat"}
          </div>
          <div className="sf-end-sub">Final score: {terminal.score}</div>
        </div>
      )}
    </div>
  );
}
