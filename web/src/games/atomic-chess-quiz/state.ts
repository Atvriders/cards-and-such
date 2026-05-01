import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AtomicChessQuizSettings { questions: "10"; }
export interface AtomicChessQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AtomicChessQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "In Atomic chess, a capture causes", choices: ["An explosion that removes the captured piece, capturer, and adjacent non-pawn pieces", "Only the captured piece to vanish", "All pieces on the file to vanish", "The board to flip"] as [string, string, string, string], correct: 0 },
  { question: "Pawns adjacent to an explosion are", choices: ["Not removed by the blast", "Removed along with everything else", "Promoted to queens", "Moved one square back"] as [string, string, string, string], correct: 0 },
  { question: "A king is lost when", choices: ["It is exploded by an adjacent capture", "It is checkmated as in standard chess only", "It is captured directly only", "It runs out of legal moves"] as [string, string, string, string], correct: 0 },
  { question: "In Atomic, you may not make a move that", choices: ["Explodes your own king", "Pushes a pawn two squares", "Castles kingside", "Promotes to a queen"] as [string, string, string, string], correct: 0 },
  { question: "If both kings would explode in the same blast,", choices: ["The capturing side wins (the mover's king cannot self-detonate)", "The game is drawn", "The pieces respawn", "Both kings move randomly"] as [string, string, string, string], correct: 0 },
  { question: "Kings cannot capture in Atomic because", choices: ["The capturing king would be destroyed in the explosion", "Kings can never capture", "It would end the game prematurely", "It would create infinite loops"] as [string, string, string, string], correct: 0 },
  { question: "Check in Atomic is", choices: ["Sometimes ignorable when the threatening piece can be detonated nearby", "Identical to standard chess always", "Impossible to deliver", "Only via knights"] as [string, string, string, string], correct: 0 },
  { question: "A standard Atomic tactic is to", choices: ["Lure pieces near the enemy king for a chain explosion", "Trade queens immediately", "Promote pawns on the a-file", "Avoid all captures"] as [string, string, string, string], correct: 0 },
  { question: "Pawn captures in Atomic", choices: ["Also cause an explosion", "Are silent and harmless", "Are forbidden", "Only explode next to a king"] as [string, string, string, string], correct: 0 },
  { question: "Atomic chess is most often played", choices: ["Online at fast time controls on Lichess", "Over-the-board in classical events", "Without any clock", "On a hex board"] as [string, string, string, string], correct: 0 },
  { question: "In Atomic, the king cannot castle through", choices: ["Squares adjacent to enemy pieces that would explode it", "Any square", "Only b1", "Diagonal squares"] as [string, string, string, string], correct: 0 },
  { question: "If two kings end up on adjacent squares,", choices: ["It is legal because neither can capture the other", "It is illegal as in standard chess", "Both explode", "The game ends in a draw"] as [string, string, string, string], correct: 0 },
  { question: "Atomic chess preserves which standard rule?", choices: ["En passant", "Castling restrictions only", "No promotion", "Three-fold repetition is removed"] as [string, string, string, string], correct: 0 },
  { question: "The blast radius of an Atomic capture is", choices: ["The eight squares surrounding the capture square (non-pawns only)", "The entire board", "Only the captured piece", "A 5x5 area"] as [string, string, string, string], correct: 0 },
  { question: "The standard checkmate pattern in Atomic involves", choices: ["Threatening to detonate the king with a capture", "Trapping the king on the back rank", "Promoting a queen", "Skewer tactics"] as [string, string, string, string], correct: 0 },
  { question: "Pawns can detonate a king if", choices: ["A pawn capture is made adjacent to it (king explodes from the blast)", "Pawns are immune to king detonation", "The pawn is on the seventh rank", "Never"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess, Atomic ratings are", choices: ["Tracked separately from standard chess", "Combined with all variants", "Hidden", "Not implemented"] as [string, string, string, string], correct: 0 },
  { question: "A common opening principle in Atomic is", choices: ["Avoid captures that would expose your king", "Always trade pieces", "Never develop pieces", "Castle queenside immediately"] as [string, string, string, string], correct: 0 },
  { question: "If only kings remain, the game is", choices: ["A draw because no captures are possible", "Won by White", "Won by whoever moves last", "Replayed"] as [string, string, string, string], correct: 0 },
  { question: "The earliest chess engine to support Atomic was likely from the", choices: ["Late 1990s online chess servers", "1800s", "1700s", "2020s only"] as [string, string, string, string], correct: 0 },
  { question: "Pinned pieces in Atomic", choices: ["Are still pinned but new tactical motifs arise from explosions", "Cannot be pinned", "Are captured automatically", "Promote"] as [string, string, string, string], correct: 0 },
  { question: "Stalemate in Atomic", choices: ["Is generally a draw as in standard chess", "Counts as a win for the stalemated side", "Counts as a loss for the stalemated side", "Reverses the position"] as [string, string, string, string], correct: 0 },
  { question: "A queen sacrifice in Atomic often aims to", choices: ["Trigger a king explosion via adjacency", "Distract the bishop", "Promote a pawn", "Trade rooks"] as [string, string, string, string], correct: 0 },
  { question: "Mass exchanges in Atomic are", choices: ["Dangerous because explosions chain", "Strongly recommended", "Required by rule", "Impossible"] as [string, string, string, string], correct: 0 },
  { question: "The term 'connected kings' refers to", choices: ["Kings standing within one square of each other", "Castled kings only", "Kings in opposition", "Kings on the seventh rank"] as [string, string, string, string], correct: 0 },
  { question: "Knights in Atomic", choices: ["Are powerful because they can attack without being captured back", "Cannot move", "Move like rooks", "Are removed at start"] as [string, string, string, string], correct: 0 },
  { question: "Atomic was designed as", choices: ["A capture-with-explosion variant of standard chess", "An entirely new ruleset", "A hex chess variant", "A Shogi spinoff"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess, Atomic uses a", choices: ["960-style or standard starting position depending on settings", "Custom hexagonal board", "Six-piece set only", "Card draw"] as [string, string, string, string], correct: 0 },
  { question: "If a non-king piece is the only piece adjacent to your king and is captured by your opponent,", choices: ["Your king explodes and you lose", "Nothing special happens", "You win", "Time is added"] as [string, string, string, string], correct: 0 },
  { question: "Atomic chess favors", choices: ["Aggressive, tactical play with king-hunt themes", "Slow positional grinding", "Endgame technique only", "Avoiding all action"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: AtomicChessQuizSettings): AtomicChessQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AtomicChessQuizState, action: AtomicChessQuizAction): AtomicChessQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AtomicChessQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
