import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Chess960QuizSettings { questions: "10"; }
export interface Chess960QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Chess960QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chess960 was popularized by", choices: ["Bobby Fischer", "Garry Kasparov", "Magnus Carlsen", "Anatoly Karpov"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 is also known as", choices: ["Fischer Random Chess", "Speed Chess", "Bullet Chess", "King of the Hill"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 has how many possible starting positions?", choices: ["960", "100", "1000", "256"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the back-rank pieces are", choices: ["Shuffled randomly subject to certain constraints", "Always in standard position", "Removed entirely", "Replaced with pawns"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 castling rules", choices: ["Adapt to allow king and rook to end up on standard squares", "Are removed", "Use a coin flip", "Are mandatory each game"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the bishops must be on", choices: ["Opposite-colored squares", "The same color", "The center", "The corner"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the king must be placed", choices: ["Between the two rooks on the back rank", "In the corner", "On the e-file", "On any square"] as [string, string, string, string], correct: 0 },
  { question: "Black's starting position in Chess960", choices: ["Mirrors White's", "Is independently random", "Is fixed", "Includes pawns shuffled too"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in Chess960", choices: ["Start on the standard second rank with normal rules", "Are shuffled", "Are removed", "Move backward"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 was introduced by Fischer in", choices: ["1996", "1972", "2000", "2010"] as [string, string, string, string], correct: 0 },
  { question: "FIDE recognized Chess960 as", choices: ["Fischer Random Chess in the 2000s", "Banned it", "Re-named it Bullet", "Demoted it to a children's game"] as [string, string, string, string], correct: 0 },
  { question: "World Chess960 Championships have been held featuring", choices: ["Top grandmasters like Magnus Carlsen and Hikaru Nakamura", "Only beginners", "Only computer programs", "Card players"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, opening preparation is", choices: ["Largely impossible because of position variety", "Even more important than standard chess", "Removed entirely", "Identical to standard"] as [string, string, string, string], correct: 0 },
  { question: "Chess960's primary aim is to", choices: ["Reduce reliance on memorized opening theory", "Make games shorter", "Eliminate draws", "Replace standard chess"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the standard starting position (RNBQKBNR) is", choices: ["One of the 960 positions", "Excluded", "The only allowed position", "Drawn from a dice roll"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 starting position numbering uses", choices: ["Reinhard Scharnagl's classification system", "FIDE only", "Random numbering", "No numbering"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, en passant", choices: ["Applies normally to the standard pawn ranks", "Is removed", "Doubles in effect", "Is reversed"] as [string, string, string, string], correct: 0 },
  { question: "After castling in Chess960, the king ends up on", choices: ["g1 (kingside) or c1 (queenside) regardless of starting square", "Any square", "Always e1", "Always h1"] as [string, string, string, string], correct: 0 },
  { question: "Famous Chess960 advocates include", choices: ["Hikaru Nakamura, Magnus Carlsen, and others", "Only Fischer", "Only Kasparov", "Only Anand"] as [string, string, string, string], correct: 0 },
  { question: "On Lichess and Chess.com, Chess960 is offered as", choices: ["A standard variant", "A premium feature only", "Tournament-only", "Not available"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, queens may start on", choices: ["Any square between the king and the rooks (subject to constraints)", "Only d1", "Only e1", "Outside the board"] as [string, string, string, string], correct: 0 },
  { question: "Bobby Fischer announced Chess960 in", choices: ["Buenos Aires in 1996", "Reykjavik in 1972", "London in 2000", "Moscow in 1985"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the engines that play it include", choices: ["Stockfish, Komodo, and others adapted to handle the variant", "No engines", "Only Deep Blue", "Only AlphaZero"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 reduces the importance of", choices: ["Memorized opening theory", "Calculation", "Endgame study", "Time management"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, players need to be skilled at", choices: ["Adapting to unfamiliar positions immediately", "Memorizing openings", "Avoiding moves", "Playing only endgames"] as [string, string, string, string], correct: 0 },
  { question: "Castling notation in Chess960 uses", choices: ["O-O for kingside and O-O-O for queenside as in standard chess", "New symbols", "Numbers only", "Greek letters"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 World Championship 2019 was won by", choices: ["Magnus Carlsen", "Bobby Fischer", "Garry Kasparov", "Hikaru Nakamura"] as [string, string, string, string], correct: 0 },
  { question: "In Chess960, the bishop pair", choices: ["Retains its strategic value as in standard chess", "Is doubled", "Is removed", "Is reduced"] as [string, string, string, string], correct: 0 },
  { question: "Hikaru Nakamura defeated Magnus Carlsen in a", choices: ["2018 Chess.com Chess960 match", "FIDE classical match", "Card tournament", "Bullet championship only"] as [string, string, string, string], correct: 0 },
  { question: "Chess960 emphasizes", choices: ["Pure chess understanding over rote memorization", "Time pressure only", "Random luck", "Card play"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Chess960QuizSettings): Chess960QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Chess960QuizState, action: Chess960QuizAction): Chess960QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Chess960QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
