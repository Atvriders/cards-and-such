import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LosAlamosQuizSettings { questions: "10"; }
export interface LosAlamosQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LosAlamosQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Los Alamos chess was a chess variant created at", choices: ["Los Alamos National Laboratory in 1956", "MIT in 1980", "Stanford in 1970", "IBM in 1990"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess was played on", choices: ["A 6x6 board", "An 8x8 board", "A 4x4 board", "A 10x10 board"] as [string, string, string, string], correct: 0 },
  { question: "The Los Alamos chess program ran on", choices: ["The MANIAC I computer", "Deep Blue", "ENIAC", "Stretch"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess omits", choices: ["Bishops", "Knights", "Rooks", "Pawns"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess is significant as", choices: ["The first program to play full chess (small board) against a human", "A modern variant", "An app", "A puzzle"] as [string, string, string, string], correct: 0 },
  { question: "The first opponent of the MANIAC I program was", choices: ["A human novice (in 1956)", "Another computer", "Deep Blue", "Bobby Fischer"] as [string, string, string, string], correct: 0 },
  { question: "Pawns in Los Alamos chess", choices: ["Cannot move two squares from the start", "Move three squares", "Promote to bishops", "Move backward"] as [string, string, string, string], correct: 0 },
  { question: "Castling in Los Alamos chess is", choices: ["Not allowed because there are no bishops and the board is small", "Mandatory", "Allowed only kingside", "Free"] as [string, string, string, string], correct: 0 },
  { question: "The Los Alamos chess program demonstrated", choices: ["Computers could play full-rules chess on a small board", "Computers can never play chess", "Card games are computable", "Go is solvable"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess used a", choices: ["Plain alpha-beta-like search with material evaluation", "Neural network", "Monte Carlo tree search", "Random play"] as [string, string, string, string], correct: 0 },
  { question: "MANIAC I had how much memory?", choices: ["Limited memory measured in kilobytes", "Gigabytes", "Megabytes", "Terabytes"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess was developed by", choices: ["Paul Stein and Mark Wells (with team members)", "Claude Shannon alone", "Alan Turing", "Marvin Minsky"] as [string, string, string, string], correct: 0 },
  { question: "Each side starts with how many pieces in Los Alamos chess?", choices: ["10 (king, queen, two rooks, two knights, six pawns)", "16", "12", "8"] as [string, string, string, string], correct: 0 },
  { question: "The reduced board size was chosen to", choices: ["Make the search tractable on 1950s hardware", "Make it fairer for humans", "Match Shogi", "Match Xiangqi"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess is sometimes considered", choices: ["A precursor to modern computer chess", "A toy", "A puzzle", "A trick-taking game"] as [string, string, string, string], correct: 0 },
  { question: "In Los Alamos chess, en passant is", choices: ["Not used because pawns cannot move two squares initially", "Mandatory", "Allowed", "Sometimes optional"] as [string, string, string, string], correct: 0 },
  { question: "The MANIAC I was located at", choices: ["Los Alamos in New Mexico", "Princeton", "Harvard", "Cambridge"] as [string, string, string, string], correct: 0 },
  { question: "MANIAC I stood for", choices: ["Mathematical Analyzer, Numerical Integrator, and Computer", "Manhattan Atomic Nuclear", "Massive Analog Numeric", "Magnetic Analyzing"] as [string, string, string, string], correct: 0 },
  { question: "Promotion in Los Alamos chess pawns is", choices: ["Allowed (promotion to queen, rook, or knight)", "Disabled", "Promotion to king", "Promotion only on certain files"] as [string, string, string, string], correct: 0 },
  { question: "The first Los Alamos chess game versus a human ended in", choices: ["The computer winning a game (against a learner) in 1956", "A draw", "Computer loss only", "Cancellation"] as [string, string, string, string], correct: 0 },
  { question: "The most famous early human player tested by Los Alamos chess was", choices: ["A laboratory secretary who had recently learned chess", "Bobby Fischer", "Garry Kasparov", "Mikhail Tal"] as [string, string, string, string], correct: 0 },
  { question: "Computers playing Los Alamos chess showed", choices: ["Search depth was limited to 4-ply", "Unlimited search", "Random play only", "Endgame database use"] as [string, string, string, string], correct: 0 },
  { question: "The Los Alamos program is documented in", choices: ["Articles by Stein, Wells, and others", "Modern AAAI proceedings", "FIDE handbook", "Encyclopedia of chess openings"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess gave evidence that", choices: ["Computers could perform meaningful chess search", "Computers cannot play chess", "Chess is uncomputable", "Bishops are essential"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess was contemporary with", choices: ["Other early computer chess efforts in the 1950s", "Deep Blue's match in 1997", "AlphaZero in 2017", "Stockfish today"] as [string, string, string, string], correct: 0 },
  { question: "On a 6x6 board, the squares total", choices: ["36", "64", "81", "49"] as [string, string, string, string], correct: 0 },
  { question: "The Los Alamos chess program's evaluation function used", choices: ["Material counting and simple positional terms", "Deep neural networks", "Monte Carlo rollouts", "Endgame tablebases"] as [string, string, string, string], correct: 0 },
  { question: "Los Alamos chess is a significant milestone in", choices: ["The history of artificial intelligence", "Cryptography", "Aviation", "Genetics"] as [string, string, string, string], correct: 0 },
  { question: "The board size of 6x6 was sometimes called", choices: ["Half-board chess by enthusiasts", "Grand chess", "Mini Shogi", "Shatranj board"] as [string, string, string, string], correct: 0 },
  { question: "After Los Alamos, full 8x8 computer chess advanced thanks to", choices: ["Faster hardware and improved search algorithms", "Hand-coding all positions", "Quantum computers", "Steam power"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: LosAlamosQuizSettings): LosAlamosQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LosAlamosQuizState, action: LosAlamosQuizAction): LosAlamosQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LosAlamosQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
