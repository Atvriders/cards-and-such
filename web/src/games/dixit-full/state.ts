import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// =====================================================================
// Deck — 84 dreamlike cards. Each card has an evocative description and
// a small set of category tags used by the CPU voting heuristic.
// =====================================================================

export interface DreamCard {
  id: number;
  emoji: string;
  label: string;
  tags: readonly string[];
}

// Categories used by both CPU clue-generation and CPU vote heuristic.
// Tag overlap = semantic proximity between clue and card.
export const DECK: readonly DreamCard[] = [
  { id: 1,  emoji: "🦋", label: "a butterfly with clockwork wings",        tags: ["nature","machine","time","flight"] },
  { id: 2,  emoji: "🏰", label: "a tower made of cake",                    tags: ["building","food","sweet","fantasy"] },
  { id: 3,  emoji: "🌙", label: "the moon sleeping in a hammock",          tags: ["sky","rest","night","dream"] },
  { id: 4,  emoji: "🐙", label: "an octopus playing a grand piano",        tags: ["sea","music","creature"] },
  { id: 5,  emoji: "🚂", label: "a train climbing into the clouds",        tags: ["machine","sky","travel","dream"] },
  { id: 6,  emoji: "🪞", label: "a mirror that shows a stranger",          tags: ["reflection","mystery","fear"] },
  { id: 7,  emoji: "🌳", label: "a tree whose leaves are tiny books",      tags: ["nature","knowledge","story"] },
  { id: 8,  emoji: "🐠", label: "fish swimming through the air",           tags: ["sea","sky","creature","dream"] },
  { id: 9,  emoji: "🕯️", label: "a candle burning underwater",            tags: ["fire","water","mystery"] },
  { id:10,  emoji: "🎈", label: "a balloon carrying a sleeping child",     tags: ["sky","child","rest","dream"] },
  { id:11,  emoji: "🗝️", label: "a key forged from frozen lightning",     tags: ["sky","cold","mystery","power"] },
  { id:12,  emoji: "🐉", label: "a tiny dragon hiding in a teacup",        tags: ["creature","fantasy","food","small"] },
  { id:13,  emoji: "📜", label: "a scroll that writes itself",             tags: ["story","magic","knowledge"] },
  { id:14,  emoji: "🌹", label: "a rose blooming on a sword",              tags: ["nature","weapon","love","fear"] },
  { id:15,  emoji: "🦊", label: "a fox wearing a paper crown",             tags: ["creature","royalty","trick"] },
  { id:16,  emoji: "⏳", label: "an hourglass full of stars",              tags: ["time","sky","dream"] },
  { id:17,  emoji: "🐌", label: "a snail carrying a city on its back",     tags: ["creature","building","slow","journey"] },
  { id:18,  emoji: "🌊", label: "a wave frozen mid-crash",                 tags: ["sea","time","cold"] },
  { id:19,  emoji: "🎭", label: "two masks whispering secrets",            tags: ["mystery","story","fear"] },
  { id:20,  emoji: "🪐", label: "a planet juggling its moons",             tags: ["sky","play","fantasy"] },
  { id:21,  emoji: "🐦", label: "a bird made entirely of envelopes",       tags: ["creature","story","flight","paper"] },
  { id:22,  emoji: "🍎", label: "an apple with a tiny door",               tags: ["food","mystery","small"] },
  { id:23,  emoji: "🌋", label: "a volcano weeping flowers",               tags: ["fire","nature","sadness"] },
  { id:24,  emoji: "🪜", label: "a ladder reaching into a puddle",         tags: ["water","journey","mystery"] },
  { id:25,  emoji: "👁️", label: "an eye floating in a jar of honey",      tags: ["mystery","fear","food"] },
  { id:26,  emoji: "🐺", label: "a wolf howling at a streetlamp",          tags: ["creature","night","city","loneliness"] },
  { id:27,  emoji: "🎻", label: "a violin played by the wind",             tags: ["music","sky","magic"] },
  { id:28,  emoji: "🪷", label: "a lotus blooming in a footprint",         tags: ["nature","journey","peace"] },
  { id:29,  emoji: "🕸️", label: "a spider weaving constellations",         tags: ["creature","sky","story"] },
  { id:30,  emoji: "🍷", label: "wine spilled into the shape of a heart",  tags: ["food","love","loss"] },
  { id:31,  emoji: "🦉", label: "an owl reading by candlelight",           tags: ["creature","knowledge","night"] },
  { id:32,  emoji: "🌪️", label: "a tornado in a teapot",                  tags: ["weather","food","small","chaos"] },
  { id:33,  emoji: "🦌", label: "a deer with antlers full of birds",       tags: ["creature","sky","nature"] },
  { id:34,  emoji: "🛶", label: "a canoe floating across the desert",      tags: ["water","desert","journey"] },
  { id:35,  emoji: "🎩", label: "a hat that releases a flock of moths",    tags: ["clothing","creature","magic"] },
  { id:36,  emoji: "❄️", label: "a snowflake the size of a window",        tags: ["cold","weather","huge"] },
  { id:37,  emoji: "🐝", label: "bees building a hive in a clock",         tags: ["creature","time","machine"] },
  { id:38,  emoji: "🍄", label: "a mushroom umbrella in the rain",         tags: ["nature","weather","small"] },
  { id:39,  emoji: "🚪", label: "a door standing alone in a meadow",       tags: ["building","nature","mystery"] },
  { id:40,  emoji: "🔥", label: "a campfire that whispers names",          tags: ["fire","story","fear"] },
  { id:41,  emoji: "🐚", label: "a seashell singing an old song",          tags: ["sea","music","memory"] },
  { id:42,  emoji: "🪶", label: "a feather heavier than a stone",          tags: ["sky","weight","mystery"] },
  { id:43,  emoji: "🌵", label: "a cactus wearing a tiny scarf",           tags: ["nature","desert","small","cold"] },
  { id:44,  emoji: "🐘", label: "an elephant balanced on a soap bubble",   tags: ["creature","fragile","wonder"] },
  { id:45,  emoji: "📖", label: "a book whose pages fly away",             tags: ["story","flight","loss"] },
  { id:46,  emoji: "🌌", label: "a galaxy poured into a coffee cup",       tags: ["sky","food","wonder"] },
  { id:47,  emoji: "🛏️", label: "a bed floating on a quiet lake",         tags: ["rest","water","dream"] },
  { id:48,  emoji: "🦢", label: "a swan made of folded letters",           tags: ["creature","story","paper","love"] },
  { id:49,  emoji: "🥀", label: "a wilted flower in a glass coffin",       tags: ["nature","loss","fear"] },
  { id:50,  emoji: "🐈", label: "a black cat painted onto the moon",       tags: ["creature","sky","night","art"] },
  { id:51,  emoji: "🎠", label: "a carousel spinning in the snow",         tags: ["play","cold","memory"] },
  { id:52,  emoji: "🪁", label: "a kite tugging a sleeping giant",         tags: ["sky","rest","huge"] },
  { id:53,  emoji: "🌻", label: "sunflowers tilting toward a streetlight", tags: ["nature","city","light"] },
  { id:54,  emoji: "🍯", label: "honey dripping from a stone face",        tags: ["food","art","sweet","mystery"] },
  { id:55,  emoji: "🐢", label: "a turtle carrying a tiny lighthouse",     tags: ["creature","sea","journey","light"] },
  { id:56,  emoji: "🎂", label: "a birthday cake with no one to eat it",   tags: ["food","sweet","loneliness"] },
  { id:57,  emoji: "🌈", label: "a rainbow bridge into the dark",          tags: ["sky","weather","journey","fear"] },
  { id:58,  emoji: "🦇", label: "bats unfolding from a closed umbrella",   tags: ["creature","night","mystery"] },
  { id:59,  emoji: "🪄", label: "a wand snapped in two",                   tags: ["magic","loss","weapon"] },
  { id:60,  emoji: "🚁", label: "a helicopter made of dragonfly wings",    tags: ["machine","creature","flight"] },
  { id:61,  emoji: "🦒", label: "a giraffe reaching for a lantern",        tags: ["creature","light","tall"] },
  { id:62,  emoji: "🌑", label: "an eclipse seen through a keyhole",       tags: ["sky","mystery","small"] },
  { id:63,  emoji: "🐟", label: "a koi swimming up a waterfall of light",  tags: ["sea","light","journey"] },
  { id:64,  emoji: "🎁", label: "a present that has been waiting too long",tags: ["loss","mystery","memory"] },
  { id:65,  emoji: "🪲", label: "a beetle wearing a tiny astronaut helmet",tags: ["creature","sky","small","wonder"] },
  { id:66,  emoji: "🌧️", label: "rain falling upward into the clouds",     tags: ["weather","sky","dream"] },
  { id:67,  emoji: "🏮", label: "lanterns released over a black sea",      tags: ["light","sea","memory","peace"] },
  { id:68,  emoji: "🐎", label: "a wild horse galloping on the rooftops",  tags: ["creature","city","journey"] },
  { id:69,  emoji: "🔮", label: "a crystal ball reflecting tomorrow",      tags: ["magic","time","mystery"] },
  { id:70,  emoji: "🪨", label: "a stone with a heartbeat",                tags: ["weight","mystery","life"] },
  { id:71,  emoji: "🌷", label: "tulips growing through piano keys",       tags: ["nature","music","art"] },
  { id:72,  emoji: "🎤", label: "a microphone in a forest clearing",       tags: ["music","nature","mystery"] },
  { id:73,  emoji: "🐞", label: "a ladybug carrying a single tear",        tags: ["creature","small","sadness"] },
  { id:74,  emoji: "🪅", label: "a piñata raining open in a thunderstorm", tags: ["play","weather","wonder"] },
  { id:75,  emoji: "🛸", label: "a UFO parking in a child's bedroom",      tags: ["sky","child","dream","wonder"] },
  { id:76,  emoji: "🦚", label: "a peacock spreading constellations",      tags: ["creature","sky","art"] },
  { id:77,  emoji: "🍂", label: "autumn leaves falling into snow",         tags: ["nature","cold","time","loss"] },
  { id:78,  emoji: "🛰️", label: "a satellite tangled in a kite string",    tags: ["machine","sky","play"] },
  { id:79,  emoji: "⚓", label: "an anchor resting on a cloud",            tags: ["sea","sky","weight","dream"] },
  { id:80,  emoji: "🎲", label: "a dice rolled by an invisible hand",      tags: ["play","mystery","luck"] },
  { id:81,  emoji: "🐇", label: "a rabbit slipping into a clock face",     tags: ["creature","time","magic"] },
  { id:82,  emoji: "🌬️", label: "wind shaped like a person walking away",  tags: ["weather","loss","journey"] },
  { id:83,  emoji: "🪦", label: "a tombstone covered in spring flowers",   tags: ["nature","loss","memory","peace"] },
  { id:84,  emoji: "💫", label: "a wish travelling slower than a comet",   tags: ["sky","dream","time"] },
];

// CPU clue templates keyed by tag — CPU storyteller picks one tag from
// its chosen card and emits a short evocative phrase. Determinism comes
// from seeded rng picking an entry.
export const CPU_CLUE_BANK: Record<string, readonly string[]> = {
  nature:    ["where the wild grows", "rooted things", "the garden remembers", "green secrets"],
  machine:   ["gears and dreams", "ticking promises", "metal heart", "engineer's lullaby"],
  time:      ["a slow hourglass", "yesterday's echo", "tomorrow already happened", "the long minute"],
  flight:    ["lift", "borrowed feathers", "a leaving thing", "above the rooftops"],
  building:  ["walls that listen", "the architect's joke", "stone bones", "a strange home"],
  food:      ["midnight snack", "sweet trespass", "the recipe was wrong", "a hungry rumor"],
  sweet:     ["honey-thought", "sugar memory", "the dentist's nightmare", "kiss-flavored"],
  fantasy:   ["impossible thing", "story-stuff", "the unreal made plain", "myth on a Tuesday"],
  sky:       ["overhead always", "the blue ceiling", "where lonely things float", "a held breath"],
  rest:      ["a long pause", "soft surrender", "the world hushed", "sleep's small kingdom"],
  night:     ["after-dark business", "the moon's gossip", "blacker than coffee", "lamp-shadow"],
  dream:     ["last night's leftover", "the unreal made plain", "almost-real", "a mind's wandering"],
  sea:       ["salt and longing", "deep and patient", "tide-thought", "the blue heavy"],
  music:     ["a tune for nobody", "the room remembers a song", "strings of feeling", "rhythm's friend"],
  creature:  ["a small wild thing", "fur, fang, or feather", "borrowed life", "the beast in waiting"],
  mystery:   ["the locked thing", "a question that bites", "look closer, no closer", "almost an answer"],
  reflection:["a second self", "the world inverted", "vain glass", "twin trouble"],
  fear:      ["small shiver", "don't look behind you", "the cold thrill", "almost a scream"],
  knowledge: ["a private library", "the answer felt like a key", "what the wise forgot", "owl-thought"],
  story:     ["once upon", "the page kept turning", "a tale telling itself", "narrator's mischief"],
  weapon:    ["edge and intent", "kept sharp", "the duelist's regret", "a held threat"],
  love:      ["a fond ache", "two-as-one", "soft trespass", "the heart's hidden chamber"],
  trick:     ["a sly grin", "the rule bent", "magician's wink", "I didn't do it"],
  royalty:   ["the small crown", "borrowed throne", "noble nonsense", "queen of nothing"],
  small:     ["barely there", "miniature wonder", "a thumb's-width", "tiny everything"],
  magic:     ["the hidden word", "unscientific", "a soft impossible", "wand's whisper"],
  weather:   ["the sky's mood", "barometric drama", "rain's cousin", "outside-weather"],
  cold:      ["a held breath", "shivered glass", "frost's company", "winter's whisper"],
  fire:      ["the bright hunger", "an unsafe friend", "warm and lethal", "the dancing thing"],
  water:     ["liquid memory", "the patient solvent", "drink it slowly", "soft and heavy"],
  desert:    ["sun-bleached quiet", "thirst-country", "where shadows hide", "the empty wide"],
  journey:   ["from-here to maybe", "the long pilgrimage", "footprint trail", "leaving slowly"],
  light:     ["the bright friend", "lantern-thought", "what the candle wanted", "shine"],
  city:      ["the loud streets", "concrete heart", "neon worship", "rooftop business"],
  loneliness:["empty room", "the single chair", "alone-feeling", "the long Sunday"],
  loss:      ["a quiet missing", "the empty chair", "almost-but-not", "what the wind took"],
  memory:    ["old echo", "yesterday hums", "the small remembering", "almost forgotten"],
  paper:     ["folded thing", "the letter never sent", "lightweight history", "origami secret"],
  chaos:     ["the lovely mess", "a tilted room", "shake and watch", "everything at once"],
  art:       ["painted truth", "the artist's wink", "made by hand", "frame it"],
  weight:    ["heavier than it looks", "the press of it", "gravity's joke", "carry it slowly"],
  huge:      ["bigger than reasonable", "the giant's nap", "scaled-up dream", "vast"],
  wonder:    ["a small gasp", "the eyes-wide thing", "marvel of nothing", "first-snowflake feeling"],
  child:     ["small hands", "the playground after dark", "kid-logic", "remember being four?"],
  clothing:  ["the disguise", "what the hatter wore", "fabric secret", "borrowed coat"],
  fragile:   ["one wrong move", "the held breath", "thin glass", "careful, careful"],
  loud:      ["the shout", "thunder's cousin", "ears ringing", "noise-rich"],
  play:      ["a small mischief", "the playground feeling", "rules invented", "carousel-bright"],
  peace:     ["a quiet kingdom", "soft-edged", "everything settled", "the breath held nicely"],
  power:     ["a slow drum", "switch flipped", "engine of yes", "the big lever"],
  sadness:   ["small wet eyes", "the slow song", "missing thing", "a quiet ache"],
  slow:      ["the long minute", "patient gait", "molasses afternoon", "drag of time"],
  tall:      ["above eye-level", "reaching", "the giraffe feeling", "stretched"],
  trick2:    ["a sly grin", "the rule bent", "magician's wink", "I didn't do it"],
  luck:      ["fortune's coin", "the small chance", "wheel of maybe", "spin again"],
  life:      ["the heartbeat thing", "alive-feeling", "blood-warm", "the breath"],
};

// =====================================================================
// Game state types
// =====================================================================

export type Phase =
  | "story-pick"      // human storyteller picks card + clue
  | "submit"          // other players submit one card each
  | "vote"            // human votes
  | "reveal"          // show results + tally
  | "done";           // somebody hit 30

export interface Player {
  id: number;                 // 0 = human, 1..3 = CPU
  name: string;
  isCpu: boolean;
  hand: number[];             // card ids
  score: number;
}

export interface Submission {
  by: number;                 // player id
  card: number;               // card id
  votes: number[];            // ids of voters
}

export interface DixitFullState {
  players: Player[];
  drawPile: number[];         // shuffled deck of remaining card ids
  round: number;
  storyteller: number;        // player id
  clue: string;
  storyCard: number | null;   // card id, or null when not chosen
  submissions: Submission[];  // ordered by display position (shuffled)
  humanVote: number | null;   // card id voted for, or null
  phase: Phase;
  lastTally: string[];        // human-readable score lines from last reveal
  winningScore: number;       // target score (30)
  // typed but not chosen clue (UI buffer)
  clueDraft: string;
  // for clue picking UI: which card the human selected to be the story card
  pendingStoryCard: number | null;
  // when last round ended, who voted for whom — used by reveal phase to show
  // CPU votes too. Keyed by player id -> card id voted for.
  votes: Record<number, number>;
}

export interface DixitFullSettings {
  _dummy: boolean;
}

export type DixitFullAction =
  | { type: "typeClue"; text: string }
  | { type: "pickStoryCard"; cardId: number }
  | { type: "submitStory" }
  | { type: "submitCard"; cardId: number } // human submission during 'submit'
  | { type: "vote"; cardId: number }
  | { type: "nextRound" };

// =====================================================================
// Helpers
// =====================================================================

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function cardById(id: number): DreamCard {
  // DECK is dense 1..84; index by id-1.
  const c = DECK[id - 1];
  if (!c) throw new Error(`Bad card id ${id}`);
  return c;
}

function drawN(pile: number[], n: number): { drawn: number[]; rest: number[] } {
  const drawn = pile.slice(0, n);
  const rest = pile.slice(n);
  return { drawn, rest };
}

// Distance between a clue and a card. Lower = better match.
// We use tag-set semantic comparison plus a string fallback.
export function clueCardAffinity(clue: string, card: DreamCard, storyCard: DreamCard): number {
  const clueLower = clue.toLowerCase();
  let score = 0;

  // Compare each tag of the *story card* against the candidate card's tags.
  // (The clue is meant to evoke the story card, so we use that as proxy.)
  for (const tag of storyCard.tags) {
    if (card.tags.includes(tag)) score += 3;
  }

  // Direct keyword leak from clue text to card description.
  const words = clueLower.split(/[^a-z]+/).filter(w => w.length > 3);
  const desc = card.label.toLowerCase();
  for (const w of words) {
    if (desc.includes(w)) score += 2;
    if (card.tags.includes(w)) score += 2;
  }

  return score;
}

// =====================================================================
// CPU strategies
// =====================================================================

/** CPU storyteller picks a card from its hand with rich tags, and a clue
 *  from CPU_CLUE_BANK keyed on one of its tags. Deterministic via rng. */
export function cpuChooseStory(hand: number[], rng: () => number): { cardId: number; clue: string } {
  // Pick the card with the most-distinct tag set (favors evocative ones)
  // tie-broken by rng.
  const ranked = hand
    .map(id => ({ id, card: cardById(id), score: cardById(id).tags.length + rng() * 0.5 }))
    .sort((a, b) => b.score - a.score);
  const chosen = ranked[0]!;
  // Pick a tag and a clue phrase.
  const tag = chosen.card.tags[Math.floor(rng() * chosen.card.tags.length)] ?? "mystery";
  const phrases = CPU_CLUE_BANK[tag] ?? CPU_CLUE_BANK.mystery!;
  const clue = phrases[Math.floor(rng() * phrases.length)] ?? "a small mystery";
  return { cardId: chosen.id, clue };
}

/** CPU submitter picks the card from its hand that best fits the clue
 *  (without leaking which card the storyteller actually has). The CPU
 *  knows the clue text but NOT the story card; we approximate by checking
 *  tag-text overlap between clue words and card tags. */
export function cpuSubmitCard(hand: number[], clue: string, rng: () => number): number {
  const clueLower = clue.toLowerCase();
  const ranked = hand.map(id => {
    const card = cardById(id);
    let score = 0;
    // Tag-text match
    for (const t of card.tags) if (clueLower.includes(t)) score += 4;
    // Description-keyword match
    const words = clueLower.split(/[^a-z]+/).filter(w => w.length > 3);
    for (const w of words) {
      if (card.label.toLowerCase().includes(w)) score += 2;
      if (card.tags.includes(w)) score += 2;
    }
    // Subtle tiebreak by rng so two CPUs don't always pick the same kind of card.
    score += rng() * 0.4;
    return { id, score };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]!.id;
}

/** CPU voter heuristic: vote for the card most evocative of the clue,
 *  EXCLUDING any card the CPU submitted themselves. Closest tag-overlap
 *  wins. Has a small rng tiebreak. */
export function cpuVote(
  voterId: number,
  clue: string,
  storyCardId: number,
  submissions: Submission[],
  rng: () => number,
): number {
  const story = cardById(storyCardId);
  const candidates = submissions.filter(s => s.by !== voterId);
  const ranked = candidates.map(s => {
    const card = cardById(s.card);
    const aff = clueCardAffinity(clue, card, story);
    return { id: s.card, score: aff + rng() * 0.3 };
  }).sort((a, b) => b.score - a.score);
  return ranked[0]?.id ?? submissions[0]!.card;
}

// =====================================================================
// Initial state
// =====================================================================

export function initialState(seed: number, _s: DixitFullSettings): DixitFullState {
  const rng = mulberry32(seed);
  const shuffled = shuffle(DECK.map(c => c.id), rng);

  const players: Player[] = [];
  const names = ["You", "Iris", "Mox", "Wren"];
  let pile = shuffled.slice();
  for (let i = 0; i < 4; i++) {
    const { drawn, rest } = drawN(pile, 6);
    pile = rest;
    players.push({ id: i, name: names[i]!, isCpu: i !== 0, hand: drawn, score: 0 });
  }

  // First storyteller is seat 0 (human) so they always start; deterministic.
  const storyteller = 0;

  return {
    players,
    drawPile: pile,
    round: 1,
    storyteller,
    clue: "",
    storyCard: null,
    submissions: [],
    humanVote: null,
    phase: "story-pick",
    lastTally: [],
    winningScore: 30,
    clueDraft: "",
    pendingStoryCard: null,
    votes: {},
  };
}

// =====================================================================
// Reducer helpers — driving CPU phases forward
// =====================================================================

// After human submits their story (clue+card), CPUs each submit one card.
// Then submissions are shuffled face-up.
function runCpuSubmissions(state: DixitFullState, rng: () => number): DixitFullState {
  if (state.storyCard == null) return state;
  const submissions: Submission[] = [{ by: state.storyteller, card: state.storyCard, votes: [] }];
  // Each non-storyteller submits.
  const others = state.players.filter(p => p.id !== state.storyteller);
  const newHands: Record<number, number[]> = {};
  for (const p of state.players) newHands[p.id] = p.hand.slice();
  for (const p of others) {
    if (p.isCpu) {
      const pick = cpuSubmitCard(newHands[p.id]!, state.clue, rng);
      submissions.push({ by: p.id, card: pick, votes: [] });
      newHands[p.id] = newHands[p.id]!.filter(c => c !== pick);
    }
    // Human submission is collected via 'submitCard' action separately.
  }
  // Also remove the storyteller's card from their hand.
  newHands[state.storyteller] = newHands[state.storyteller]!.filter(c => c !== state.storyCard);

  // Shuffle face-up display order.
  const shuffled = shuffle(submissions, rng);

  const players = state.players.map(p => ({ ...p, hand: newHands[p.id]! }));
  return { ...state, submissions: shuffled, players };
}

// When the storyteller is a CPU, immediately resolve their pick.
function autoCpuStoryteller(state: DixitFullState, rng: () => number): DixitFullState {
  const teller = state.players[state.storyteller]!;
  if (!teller.isCpu) return state;
  const { cardId, clue } = cpuChooseStory(teller.hand, rng);
  const s2: DixitFullState = { ...state, storyCard: cardId, clue, clueDraft: clue, pendingStoryCard: cardId };
  // CPUs submit (skipping human — human acts via 'submitCard')
  const s3 = runCpuSubmissions(s2, rng);
  return { ...s3, phase: "submit" };
}

// Once all submissions are in (human + CPUs), CPUs cast their votes.
function runCpuVotes(state: DixitFullState, rng: () => number): DixitFullState {
  if (state.storyCard == null) return state;
  const votes: Record<number, number> = { ...state.votes };
  for (const p of state.players) {
    if (p.id === state.storyteller) continue;
    if (!p.isCpu) continue;
    votes[p.id] = cpuVote(p.id, state.clue, state.storyCard, state.submissions, rng);
  }
  return { ...state, votes };
}

// Resolve scoring once all votes are in (human + CPUs). Per rules:
// - If ALL or NONE of the non-storytellers guess the storyteller card,
//   storyteller scores 0, all others score 2.
// - Otherwise storyteller + each correct voter score 3.
// - Each non-storyteller also scores +1 per vote on their own card.
function resolveScoring(state: DixitFullState): DixitFullState {
  if (state.storyCard == null) return state;
  const storyId = state.storyCard;
  const nonTellers = state.players.filter(p => p.id !== state.storyteller);
  let correct = 0;
  const correctVoterIds: number[] = [];
  for (const v of nonTellers) {
    if (state.votes[v.id] === storyId) {
      correct++;
      correctVoterIds.push(v.id);
    }
  }

  const tally: string[] = [];
  const addScore: Record<number, number> = {};
  for (const p of state.players) addScore[p.id] = 0;

  const allOrNone = correct === 0 || correct === nonTellers.length;
  if (allOrNone) {
    for (const p of nonTellers) addScore[p.id]! += 2;
    tally.push(correct === 0
      ? `Nobody found the storyteller's card — storyteller +0, everyone else +2.`
      : `Everyone found it — storyteller +0, everyone else +2.`);
  } else {
    addScore[state.storyteller]! += 3;
    for (const id of correctVoterIds) addScore[id]! += 3;
    tally.push(`Storyteller +3, correct guessers (${correctVoterIds.length}) +3 each.`);
  }

  // Vote bonuses for non-storyteller cards.
  for (const sub of state.submissions) {
    if (sub.by === state.storyteller) continue;
    const votesOnIt = nonTellers.filter(v => state.votes[v.id] === sub.card).length;
    if (votesOnIt > 0) {
      addScore[sub.by]! += votesOnIt;
      tally.push(`${state.players[sub.by]!.name}'s card drew ${votesOnIt} vote${votesOnIt === 1 ? "" : "s"} (+${votesOnIt}).`);
    }
  }

  const players = state.players.map(p => ({ ...p, score: p.score + addScore[p.id]! }));
  // Attach votes back to submissions for reveal display.
  const submissions = state.submissions.map(s => ({
    ...s,
    votes: nonTellers.filter(v => state.votes[v.id] === s.card).map(v => v.id),
  }));
  return { ...state, players, submissions, lastTally: tally, phase: "reveal" };
}

// Set up next round: rotate storyteller, refill hands, reset round state.
function beginNextRound(state: DixitFullState, rng: () => number): DixitFullState {
  if (state.players.some(p => p.score >= state.winningScore)) {
    return { ...state, phase: "done" };
  }
  // Refill each player's hand to 6.
  let pile = state.drawPile.slice();
  const players = state.players.map(p => {
    const need = 6 - p.hand.length;
    if (need <= 0) return p;
    const { drawn, rest } = drawN(pile, need);
    pile = rest;
    return { ...p, hand: [...p.hand, ...drawn] };
  });
  // If draw pile would run out, reshuffle from discard? In this MVP we just
  // continue with whatever players have; usually 30 pts arrives in 10-15 rounds.

  const nextTeller = ((state.storyteller + 1) % state.players.length) as number;
  let next: DixitFullState = {
    ...state,
    players,
    drawPile: pile,
    round: state.round + 1,
    storyteller: nextTeller,
    clue: "",
    clueDraft: "",
    storyCard: null,
    pendingStoryCard: null,
    submissions: [],
    humanVote: null,
    votes: {},
    lastTally: [],
    phase: "story-pick",
  };
  // If the next storyteller is CPU, auto-resolve.
  if (next.players[nextTeller]!.isCpu) {
    next = autoCpuStoryteller(next, rng);
  }
  return next;
}

// Stable rng for a given state — derive from (round, storyteller, scores)
// so reducer transitions remain deterministic across runs of the same game.
function rngFor(state: DixitFullState, salt: number): () => number {
  const tot = state.players.reduce((a, p) => a + p.score, 0);
  return mulberry32(((state.round * 31 + state.storyteller * 7 + tot) ^ salt) >>> 0);
}

// =====================================================================
// Reducer
// =====================================================================

export function reducer(state: DixitFullState, action: DixitFullAction): DixitFullState {
  switch (action.type) {
    case "typeClue": {
      if (state.phase !== "story-pick") return state;
      // Cap at 80 chars; allow most printable text.
      const text = action.text.slice(0, 80);
      return { ...state, clueDraft: text };
    }
    case "pickStoryCard": {
      if (state.phase !== "story-pick") return state;
      if (state.players[state.storyteller]!.isCpu) return state;
      const hand = state.players[state.storyteller]!.hand;
      if (!hand.includes(action.cardId)) return state;
      return { ...state, pendingStoryCard: action.cardId };
    }
    case "submitStory": {
      if (state.phase !== "story-pick") return state;
      if (state.players[state.storyteller]!.isCpu) return state;
      if (state.pendingStoryCard == null) return state;
      if (state.clueDraft.trim().length === 0) return state;
      const rng = rngFor(state, 11);
      const s2: DixitFullState = {
        ...state,
        storyCard: state.pendingStoryCard,
        clue: state.clueDraft.trim(),
      };
      const s3 = runCpuSubmissions(s2, rng);
      // When human is storyteller, all 3 non-storytellers are CPUs and have
      // submitted. The human doesn't vote (storyteller never votes), so
      // we advance straight through vote → reveal automatically.
      const s4: DixitFullState = { ...s3, phase: "submit" };
      const s5 = runCpuVotes(s4, rng);
      return resolveScoring(s5);
    }
    case "submitCard": {
      if (state.phase !== "submit") return state;
      // Human is submitter only when not storyteller.
      const humanId = 0;
      if (humanId === state.storyteller) return state;
      const human = state.players[humanId]!;
      if (!human.hand.includes(action.cardId)) return state;
      // Add submission; remove from hand.
      const newSubs = [...state.submissions, { by: humanId, card: action.cardId, votes: [] }];
      // Re-shuffle so face-up order doesn't reveal who submitted last.
      const rng = rngFor(state, 23);
      const shuffled = shuffle(newSubs, rng);
      const players = state.players.map(p =>
        p.id === humanId ? { ...p, hand: p.hand.filter(c => c !== action.cardId) } : p
      );
      const s2: DixitFullState = { ...state, submissions: shuffled, players };
      // Advance to vote phase.
      return { ...s2, phase: "vote" };
    }
    case "vote": {
      if (state.phase !== "vote") return state;
      const humanId = 0;
      if (humanId === state.storyteller) return state; // storyteller doesn't vote
      // Can't vote for own card.
      const ownCard = state.submissions.find(s => s.by === humanId)?.card;
      if (ownCard === action.cardId) return state;
      // Must vote for a card that is actually on the table.
      if (!state.submissions.some(s => s.card === action.cardId)) return state;
      const rng = rngFor(state, 37);
      const withHumanVote: DixitFullState = {
        ...state,
        humanVote: action.cardId,
        votes: { ...state.votes, [humanId]: action.cardId },
      };
      // If human IS the storyteller this round, this path isn't hit.
      // Now CPUs vote.
      const withCpuVotes = runCpuVotes(withHumanVote, rng);
      // Resolve scoring.
      return resolveScoring(withCpuVotes);
    }
    case "nextRound": {
      if (state.phase !== "reveal") return state;
      const rng = rngFor(state, 53);
      let next = beginNextRound(state, rng);
      // If a CPU is now storyteller (set inside beginNextRound), and the human
      // is now an ordinary submitter, we stop at 'submit' phase to let the
      // human pick a card.
      // If we already entered 'done', just leave.
      if (next.phase === "submit" && next.players[0]!.id !== next.storyteller) {
        // human awaits in submit phase
      }
      return next;
    }
    default:
      return state;
  }
}

// =====================================================================
// Terminal check
// =====================================================================

export function isTerminal(state: DixitFullState): { score: number } | null {
  if (state.phase !== "done") return null;
  // Player score = the human's final score. If a CPU won, return 0 for the
  // leaderboard.
  const human = state.players[0]!;
  const max = Math.max(...state.players.map(p => p.score));
  const humanWon = human.score === max;
  return { score: humanWon ? human.score : 0 };
}

// Public for tests / UI:
export function getStoryteller(state: DixitFullState): Player {
  return state.players[state.storyteller]!;
}

export function humanIsStoryteller(state: DixitFullState): boolean {
  return state.storyteller === 0;
}

export function cardForId(id: number): DreamCard {
  return cardById(id);
}
