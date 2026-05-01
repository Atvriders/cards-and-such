import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go9QuizSettings { questions: "10"; }
export interface Go9QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go9QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "9x9 Go is played on", choices: ["A 9x9 grid", "A 13x13 grid", "A 19x19 grid", "An 11x11 grid"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is often used for", choices: ["Beginners and quick games", "Tournament championship play only", "Solo puzzles only", "Computer-only play"] as [string, string, string, string], correct: 0 },
  { question: "The first move in 9x9 Go is typically", choices: ["Played by Black", "Played by White", "Random", "Skipped"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, komi (compensation for White) is usually", choices: ["Around 5.5 to 7 points to balance Black's first-move advantage", "Zero", "20 points", "Negative"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go games typically last", choices: ["Around 50-80 moves", "300 moves", "Five moves", "Hours of play in classical time"] as [string, string, string, string], correct: 0 },
  { question: "The objective of Go is to", choices: ["Surround more territory than the opponent", "Capture the opponent's king", "Form a line of five", "Promote stones"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go was solved by computers", choices: ["For perfect play in some specific positions, with strong AI engines", "Completely for all positions", "Never", "Only for White"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go favors", choices: ["Aggressive, tactical play due to limited space", "Slow strategic play only", "Pure luck", "Card draws"] as [string, string, string, string], correct: 0 },
  { question: "Modern Go AI like AlphaGo Zero", choices: ["Demonstrated mastery on 19x19 boards but extends to 9x9 with ease", "Cannot play 9x9", "Plays only 5x5", "Plays only checkers"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, the first move is often played", choices: ["At the center (tengen) or near it", "In a corner", "On the edge", "Off the board"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is taught to beginners because", choices: ["Its short games allow rapid learning of fundamentals", "It is easier than 19x19", "It is harder than 19x19", "It uses cards"] as [string, string, string, string], correct: 0 },
  { question: "In Go, a stone is captured when", choices: ["All its liberties are occupied by enemy stones", "It is placed on a corner", "Two stones meet", "It crosses the center"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go has how many points (intersections)?", choices: ["Eighty-one", "Sixty-four", "One hundred", "Three-sixty-one"] as [string, string, string, string], correct: 0 },
  { question: "Liberties of a stone are", choices: ["Empty adjacent points (orthogonally)", "Diagonal points", "Captured stones", "Score multipliers"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, ko rules", choices: ["Apply normally as in 19x19 Go", "Are removed", "Are doubled", "Are random"] as [string, string, string, string], correct: 0 },
  { question: "Komi was historically", choices: ["Added to balance Black's first-move advantage", "Random points", "A penalty", "A bonus for ties"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, the corner moves", choices: ["Are still important but less dominant than on 19x19", "Are forbidden", "Don't exist", "Score double"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go endings often involve", choices: ["Sharp tactical fights for territory", "Quiet positional play only", "Luck-based scoring", "Random selection"] as [string, string, string, string], correct: 0 },
  { question: "Counting territory in Go means", choices: ["Empty intersections surrounded by your stones plus captures", "Captured stones only", "Total stones placed", "Time used"] as [string, string, string, string], correct: 0 },
  { question: "Suicide in 9x9 Go is", choices: ["Forbidden by Japanese rules; allowed in some rule sets if it captures", "Always allowed", "Always forbidden", "Random"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is sometimes used for", choices: ["Quick teaching games at clubs and online lessons", "Tournament championship finals only", "Puzzle solving only", "Card play"] as [string, string, string, string], correct: 0 },
  { question: "On a 9x9 board, the standard handicap system", choices: ["Has fewer levels than on 19x19", "Has more levels than on 19x19", "Doesn't exist", "Uses dice"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, ladders (escape attempts)", choices: ["Are easier to read because the board is smaller", "Are harder than on 19x19", "Don't exist", "Are random"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go online is offered on", choices: ["Online Go server (OGS), Lichess Go, KGS, and others", "Only one platform", "No platform", "Mahjong sites"] as [string, string, string, string], correct: 0 },
  { question: "Black's first-move advantage in 9x9 Go is", choices: ["Significant; komi typically reflects 5.5-7.5 points", "Negligible", "Negative", "Zero"] as [string, string, string, string], correct: 0 },
  { question: "AlphaGo Zero learned 9x9 Go", choices: ["Through self-play, achieving superhuman strength", "By memorizing pro games", "By solving exhaustively", "By playing humans only"] as [string, string, string, string], correct: 0 },
  { question: "The simplest 9x9 Go opening principle is", choices: ["Take the center or three-three points first", "Always play on edges", "Play randomly", "Avoid corners"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is often part of", choices: ["Go programs for schools and clubs", "Casino gambling", "Card tournaments", "Magic shows"] as [string, string, string, string], correct: 0 },
  { question: "In 9x9 Go, the average game has", choices: ["Fewer total moves than 19x19", "More total moves than 19x19", "The same number as 19x19", "Zero moves"] as [string, string, string, string], correct: 0 },
  { question: "9x9 Go is a perfect-information game", choices: ["Yes, with no hidden state", "No, it has hidden cards", "It uses dice", "It involves bluffing"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go9QuizSettings): Go9QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go9QuizState, action: Go9QuizAction): Go9QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go9QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
