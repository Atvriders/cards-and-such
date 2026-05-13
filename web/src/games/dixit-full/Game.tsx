import { useEffect, useRef } from "react";
import type { GameProps } from "../../platform/game-plugin/types.js";
import type { DixitFullState, DixitFullAction, DixitFullSettings } from "./state.js";
import { isTerminal, cardForId, humanIsStoryteller, getStoryteller } from "./state.js";
import "./Game.css";

function CardChip({
  cardId,
  selected,
  onClick,
  label,
  testId,
}: {
  cardId: number;
  selected?: boolean | undefined;
  onClick?: (() => void) | undefined;
  label?: string | undefined;
  testId?: string | undefined;
}): JSX.Element {
  const c = cardForId(cardId);
  return (
    <button
      type="button"
      className={`dxf-card${selected ? " dxf-card--selected" : ""}${onClick ? "" : " dxf-card--static"}`}
      onClick={onClick}
      disabled={!onClick}
      title={c.label}
      aria-label={`Card: ${c.label}`}
      data-testid={testId}
    >
      <span className="dxf-card-emoji" aria-hidden>{c.emoji}</span>
      <span className="dxf-card-text">{c.label}</span>
      {label && <span className="dxf-card-tag">{label}</span>}
    </button>
  );
}

function Scoreboard({ state }: { state: DixitFullState }): JSX.Element {
  return (
    <div className="dxf-scoreboard" aria-label="Scoreboard">
      {state.players.map(p => (
        <div
          key={p.id}
          className={`dxf-score dxf-score--p${p.id}${p.id === state.storyteller ? " dxf-score--teller" : ""}`}
          title={p.id === state.storyteller ? `${p.name} is the storyteller` : `${p.name}'s score`}
        >
          <span className="dxf-score-name">{p.name}</span>
          <span className="dxf-score-val pulse">{p.score}</span>
          {p.id === state.storyteller && <span className="dxf-score-role">teller</span>}
        </div>
      ))}
    </div>
  );
}

export function DixitFullGame({
  state,
  dispatch,
  onGameOver,
}: GameProps<DixitFullState, DixitFullSettings>): JSX.Element {
  const terminal = isTerminal(state);
  const endedRef = useRef(false);
  useEffect(() => {
    if (terminal && !endedRef.current) {
      endedRef.current = true;
      onGameOver(terminal.score);
    }
  }, [terminal, onGameOver]);

  const human = state.players[0]!;
  const teller = getStoryteller(state);
  const humanIsTeller = humanIsStoryteller(state);

  // The human's own submitted card during the current round (face-down).
  const humanSub = state.submissions.find(s => s.by === 0)?.card ?? null;

  const winner = state.phase === "done"
    ? state.players.slice().sort((a, b) => b.score - a.score)[0]!
    : null;

  return (
    <div className="dxf fade-in">
      <header className="dxf-header">
        <h2 className="dxf-title">Dixit</h2>
        <div className="dxf-meta">
          Round {state.round} · First to {state.winningScore} pts wins
        </div>
      </header>

      <Scoreboard state={state} />

      {state.phase === "story-pick" && (
        <section className="dxf-phase dxf-phase--pick">
          {humanIsTeller ? (
            <>
              <p className="dxf-prompt">
                <strong>You are the storyteller.</strong> Pick one card from your hand and give an evocative one-sentence clue.
              </p>
              <div className="dxf-clue-row">
                <label htmlFor="dxf-clue-input" className="dxf-label">Your clue:</label>
                <input
                  id="dxf-clue-input"
                  className="dxf-input"
                  type="text"
                  value={state.clueDraft}
                  maxLength={80}
                  placeholder="e.g. The dream I had on Tuesday"
                  onChange={e => dispatch({ type: "typeClue", text: e.target.value } satisfies DixitFullAction)}
                  data-testid="dxf-clue-input"
                />
              </div>
              <div className="dxf-hand-label">Your hand — click the card that matches your clue:</div>
              <div className="dxf-hand">
                {human.hand.map(id => (
                  <CardChip
                    key={id}
                    cardId={id}
                    selected={state.pendingStoryCard === id}
                    onClick={() => dispatch({ type: "pickStoryCard", cardId: id } satisfies DixitFullAction)}
                    testId={`dxf-hand-${id}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="dxf-btn dxf-btn--primary"
                disabled={state.pendingStoryCard == null || state.clueDraft.trim().length === 0}
                title="Confirm your card and clue"
                onClick={() => dispatch({ type: "submitStory" } satisfies DixitFullAction)}
                data-testid="dxf-submit-story"
              >
                Tell the story
              </button>
            </>
          ) : (
            <p className="dxf-prompt">
              {teller.name} is choosing a card and clue…
              <span className="dxf-spinner" aria-hidden>•••</span>
            </p>
          )}
        </section>
      )}

      {state.phase === "submit" && !humanIsTeller && (
        <section className="dxf-phase dxf-phase--submit">
          <div className="dxf-clue-banner">
            <span className="dxf-clue-label">{teller.name}'s clue:</span>
            <span className="dxf-clue-text">"{state.clue}"</span>
          </div>
          <p className="dxf-prompt">Pick the card from your hand that best matches the clue:</p>
          <div className="dxf-hand">
            {human.hand.map(id => (
              <CardChip
                key={id}
                cardId={id}
                onClick={() => dispatch({ type: "submitCard", cardId: id } satisfies DixitFullAction)}
                testId={`dxf-submit-${id}`}
              />
            ))}
          </div>
        </section>
      )}

      {state.phase === "vote" && !humanIsTeller && (
        <section className="dxf-phase dxf-phase--vote">
          <div className="dxf-clue-banner">
            <span className="dxf-clue-label">{teller.name}'s clue:</span>
            <span className="dxf-clue-text">"{state.clue}"</span>
          </div>
          <p className="dxf-prompt">Vote for the card you think is the storyteller's. You cannot vote for your own card.</p>
          <div className="dxf-table">
            {state.submissions.map(s => {
              const isOwn = s.card === humanSub;
              return (
                <CardChip
                  key={s.card}
                  cardId={s.card}
                  selected={state.humanVote === s.card}
                  onClick={isOwn ? undefined : () => dispatch({ type: "vote", cardId: s.card } satisfies DixitFullAction)}
                  label={isOwn ? "yours" : undefined}
                  testId={`dxf-vote-${s.card}`}
                />
              );
            })}
          </div>
        </section>
      )}

      {state.phase === "reveal" && (
        <section className="dxf-phase dxf-phase--reveal">
          <div className="dxf-clue-banner">
            <span className="dxf-clue-label">{teller.name}'s clue was:</span>
            <span className="dxf-clue-text">"{state.clue}"</span>
          </div>
          <div className="dxf-table dxf-table--reveal">
            {state.submissions.map(s => {
              const isStory = s.card === state.storyCard;
              const submitter = state.players[s.by]!;
              return (
                <div key={s.card} className={`dxf-reveal-card${isStory ? " dxf-reveal-card--story" : ""}`}>
                  <CardChip cardId={s.card} label={isStory ? "STORY" : submitter.name} />
                  <div className="dxf-reveal-votes" title="Voters">
                    {s.votes.length === 0 ? "—" : s.votes.map(vid => state.players[vid]!.name).join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
          <ul className="dxf-tally">
            {state.lastTally.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
          <button
            type="button"
            className="dxf-btn dxf-btn--primary"
            title="Deal the next round"
            onClick={() => dispatch({ type: "nextRound" } satisfies DixitFullAction)}
            data-testid="dxf-next-round"
          >
            Next round
          </button>
        </section>
      )}

      {state.phase === "done" && winner && (
        <section className="dxf-phase dxf-phase--done bounce-in" data-testid="dxf-done">
          <h3 className="dxf-win-title">
            {winner.id === 0 ? "You win!" : `${winner.name} wins!`}
          </h3>
          <p className="dxf-win-sub">Final scores:</p>
          <ul className="dxf-final-list">
            {state.players
              .slice()
              .sort((a, b) => b.score - a.score)
              .map(p => (
                <li key={p.id}>
                  <strong>{p.name}</strong>: {p.score}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
