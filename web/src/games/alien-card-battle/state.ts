import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AlienCardBattleSettings {
  rounds: "5" | "7" | "10";
}

export type AlienType = "zorg" | "nexu" | "vrix" | "plaz";

export interface AlienCard {
  id: number;
  species: AlienType;
  strength: number;
  ability: "double" | "steal" | "block" | "none";
  name: string;
}

export interface AlienCardBattleState {
  settings: AlienCardBattleSettings;
  rngSeed: number;
  playerHand: AlienCard[];
  opponentHand: AlienCard[];
  deck: AlienCard[];
  playerScore: number;
  opponentScore: number;
  roundNum: number;
  totalRounds: number;
  selectedIdx: number | null;
  lastPlayerCard: AlienCard | null;
  lastOpponentCard: AlienCard | null;
  roundResult: string;
  log: string[];
  gameOver: boolean;
  playerWon: boolean;
}

export type AlienCardBattleAction =
  | { type: "select"; idx: number }
  | { type: "play" }
  | { type: "restart" };

const CARD_TEMPLATES: { species: AlienType; strength: number; ability: AlienCard["ability"]; name: string }[] = [
  { species: "zorg", strength: 6, ability: "none", name: "Zorg Warrior" },
  { species: "zorg", strength: 4, ability: "double", name: "Zorg Amplifier" },
  { species: "nexu", strength: 7, ability: "none", name: "Nexu Hunter" },
  { species: "nexu", strength: 3, ability: "steal", name: "Nexu Thief" },
  { species: "vrix", strength: 5, ability: "block", name: "Vrix Guardian" },
  { species: "vrix", strength: 8, ability: "none", name: "Vrix Colossus" },
  { species: "plaz", strength: 2, ability: "double", name: "Plaz Booster" },
  { species: "plaz", strength: 5, ability: "steal", name: "Plaz Pirate" },
  { species: "zorg", strength: 9, ability: "none", name: "Zorg Commander" },
  { species: "nexu", strength: 4, ability: "block", name: "Nexu Shield" },
  { species: "vrix", strength: 3, ability: "steal", name: "Vrix Raider" },
  { species: "plaz", strength: 7, ability: "none", name: "Plaz Champion" },
];

function buildDeck(seed: number): AlienCard[] {
  const rng = mulberry32(seed);
  const cards: AlienCard[] = [];
  for (let i = 0; i < 24; i++) {
    const t = CARD_TEMPLATES[i % CARD_TEMPLATES.length]!;
    cards.push({ id: i, ...t });
  }
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
  }
  return cards;
}

export function initialState(seed: number, settings: AlienCardBattleSettings): AlienCardBattleState {
  const deck = buildDeck(seed);
  const totalRounds = parseInt(settings.rounds, 10);
  const playerHand = deck.slice(0, 4);
  const opponentHand = deck.slice(4, 8);
  const remaining = deck.slice(8);
  return {
    settings,
    rngSeed: seed,
    playerHand,
    opponentHand,
    deck: remaining,
    playerScore: 0,
    opponentScore: 0,
    roundNum: 1,
    totalRounds,
    selectedIdx: null,
    lastPlayerCard: null,
    lastOpponentCard: null,
    roundResult: "Choose a card to battle!",
    log: [],
    gameOver: false,
    playerWon: false,
  };
}

function resolveRound(player: AlienCard, opponent: AlienCard, rng: () => number): { playerGain: number; opponentGain: number; msg: string } {
  let pStr = player.strength;
  let oStr = opponent.strength;
  let msg = `${player.name} (${pStr}) vs ${opponent.name} (${oStr}). `;

  // Abilities
  if (player.ability === "double") { pStr *= 2; msg += `${player.name} doubles to ${pStr}! `; }
  if (opponent.ability === "double") { oStr *= 2; msg += `${opponent.name} doubles to ${oStr}! `; }
  if (player.ability === "block" && oStr > pStr) { oStr = pStr; msg += `${player.name} blocks! `; }
  if (opponent.ability === "block" && pStr > oStr) { pStr = oStr; msg += `${opponent.name} blocks! `; }
  if (player.ability === "steal" && oStr > 0) { pStr += Math.floor(oStr * 0.4); oStr = Math.floor(oStr * 0.6); msg += `${player.name} steals power! `; }
  if (opponent.ability === "steal" && pStr > 0) { oStr += Math.floor(pStr * 0.4); pStr = Math.floor(pStr * 0.6); msg += `${opponent.name} steals power! `; }

  void rng;
  if (pStr > oStr) {
    msg += "You win this round!";
    return { playerGain: 1, opponentGain: 0, msg };
  } else if (oStr > pStr) {
    msg += "Opponent wins this round!";
    return { playerGain: 0, opponentGain: 1, msg };
  } else {
    msg += "Draw!";
    return { playerGain: 0, opponentGain: 0, msg };
  }
}

export function reducer(state: AlienCardBattleState, action: AlienCardBattleAction): AlienCardBattleState {
  if (action.type === "restart") return initialState(state.rngSeed + 1, state.settings);
  if (state.gameOver) return state;

  if (action.type === "select") {
    if (action.idx < 0 || action.idx >= state.playerHand.length) return state;
    return { ...state, selectedIdx: action.idx };
  }

  if (action.type === "play") {
    if (state.selectedIdx === null) return state;
    const playerCard = state.playerHand[state.selectedIdx];
    if (!playerCard) return state;

    const rng = mulberry32(state.rngSeed + state.roundNum * 13);
    const oppIdx = Math.floor(rng() * state.opponentHand.length);
    const oppCard = state.opponentHand[oppIdx] ?? state.opponentHand[0];
    if (!oppCard) return state;

    const { playerGain, opponentGain, msg } = resolveRound(playerCard, oppCard, rng);

    const playerScore = state.playerScore + playerGain;
    const opponentScore = state.opponentScore + opponentGain;

    // Replace played cards
    let deck = [...state.deck];
    let playerHand = state.playerHand.filter((_, i) => i !== state.selectedIdx);
    let opponentHand = state.opponentHand.filter((_, i) => i !== oppIdx);

    if (deck.length > 0) { playerHand = [...playerHand, deck[0]!]; deck = deck.slice(1); }
    if (deck.length > 0) { opponentHand = [...opponentHand, deck[0]!]; deck = deck.slice(1); }

    const roundNum = state.roundNum + 1;
    const gameOver = roundNum > state.totalRounds || playerHand.length === 0;
    const playerWon = gameOver && playerScore > opponentScore;

    return {
      ...state,
      playerHand,
      opponentHand,
      deck,
      playerScore,
      opponentScore,
      roundNum,
      selectedIdx: null,
      lastPlayerCard: playerCard,
      lastOpponentCard: oppCard,
      roundResult: msg,
      log: [...state.log, msg].slice(-5),
      gameOver,
      playerWon,
    };
  }

  return state;
}

export function isTerminal(state: AlienCardBattleState): { score: number } | null {
  if (!state.gameOver) return null;
  const ratio = state.playerScore / Math.max(1, state.playerScore + state.opponentScore);
  return { score: Math.round(ratio * 100) };
}
