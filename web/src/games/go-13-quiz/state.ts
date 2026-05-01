import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface Go13QuizSettings { questions: "10"; }
export interface Go13QuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type Go13QuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "13x13 Go is played on", choices: ["A 13x13 grid (169 intersections)", "A 9x9 grid", "A 19x19 grid", "An 11x11 grid"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go serves as", choices: ["An intermediate step between 9x9 and 19x19 Go", "A beginner's first board", "Solo puzzles only", "Computer-only play"] as [string, string, string, string], correct: 0 },
  { question: "In 13x13 Go, the typical komi is", choices: ["Around 6.5 to 7.5 points", "Twenty points", "Zero points", "Negative"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go has how many intersections?", choices: ["169", "81", "361", "100"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go offers", choices: ["More space for strategic play than 9x9 but faster than 19x19", "Less space than 9x9", "Same space as 19x19", "Random sizes"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go is sometimes used for", choices: ["Practice and teaching after 9x9 mastery", "Championship finals only", "Card games", "Solo only"] as [string, string, string, string], correct: 0 },
  { question: "Black plays first in 13x13 Go", choices: ["Yes, as in standard Go", "No, White plays first", "Random", "Both move simultaneously"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go AI engines include", choices: ["Top programs adapted from 19x19 such as KataGo", "Specialized 13x13 only", "No engines", "Card AIs"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go endings", choices: ["Combine territory counting and capture tactics", "Use only captures", "Use only territory", "Use scoring cards"] as [string, string, string, string], correct: 0 },
  { question: "In 13x13 Go, the corners", choices: ["Are still strategically important early in the game", "Don't exist", "Score zero", "Are forbidden"] as [string, string, string, string], correct: 0 },
  { question: "Liberty rules in 13x13 Go", choices: ["Apply identically to all Go board sizes", "Are doubled", "Are removed", "Use cards"] as [string, string, string, string], correct: 0 },
  { question: "Ko rules in 13x13 Go", choices: ["Apply normally", "Are removed", "Apply only on edges", "Are scored"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go games are typically completed in", choices: ["Around 100-150 moves on average", "1000 moves", "Under 10 moves", "Without moves"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go is offered online on", choices: ["Online Go server (OGS) and others", "Only Mahjong sites", "No platform", "Card sites"] as [string, string, string, string], correct: 0 },
  { question: "Counting territory in 13x13 Go", choices: ["Includes empty intersections surrounded by your stones plus prisoners", "Includes only stones placed", "Uses time", "Uses cards"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go was popularized as", choices: ["A practice format for serious learners", "A children-only format", "A hex variant", "A card variant"] as [string, string, string, string], correct: 0 },
  { question: "Suicide rule in 13x13 Go", choices: ["Same as standard Go (forbidden under Japanese rules)", "Always allowed", "Always forbidden", "Random"] as [string, string, string, string], correct: 0 },
  { question: "Standard handicaps in 13x13 Go", choices: ["Are placed on traditional points adapted for board size", "Don't exist", "Use ten stones", "Are random"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go strategy involves", choices: ["Influence and territorial balance", "Pure tactics only", "Card draws", "Auctions"] as [string, string, string, string], correct: 0 },
  { question: "Top human players for 13x13 Go include", choices: ["Pros who use 13x13 for casual or training games", "Beginners only", "Computer programs only", "Children only"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go has a slight first-move advantage", choices: ["Yes; komi compensates for Black's advantage", "No; first-move advantage doesn't exist", "Reversed; White has advantage", "Negligible only"] as [string, string, string, string], correct: 0 },
  { question: "On 13x13 Go, the most common opening points are", choices: ["Star points (hoshi) at 4-4 or 3-3 corner approaches", "Center always", "Edge always", "Random"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go is offered for", choices: ["Online tournaments and casual play", "Olympic events only", "FIDE chess events", "Card tournaments"] as [string, string, string, string], correct: 0 },
  { question: "The historical use of 13x13 Go was", choices: ["Limited; the standard board is 19x19", "Mainstream", "FIDE-only", "Solo only"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go AI like KataGo", choices: ["Plays at superhuman levels", "Is unable to play", "Plays only 5x5", "Plays only checkers"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go endgame includes", choices: ["Sente and gote moves analyzed at endgame counting", "Card draws", "Dice rolls", "Bidding"] as [string, string, string, string], correct: 0 },
  { question: "Final scoring in 13x13 Go uses", choices: ["Territory plus prisoners (Japanese) or area scoring (Chinese)", "Captures only", "Time used", "Bid amounts"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go is taught after", choices: ["Players have mastered 9x9 fundamentals", "Players have learned 19x19", "Players have learned chess", "Players have learned bridge"] as [string, string, string, string], correct: 0 },
  { question: "13x13 Go feels", choices: ["Faster than 19x19 but more strategic than 9x9", "Slower than 19x19", "Identical to 9x9", "Identical to 19x19"] as [string, string, string, string], correct: 0 },
  { question: "In 13x13 Go, a common opening move is", choices: ["A 4-4 point in a corner", "Center always", "Tenuki always", "On the edge"] as [string, string, string, string], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: Go13QuizSettings): Go13QuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: Go13QuizState, action: Go13QuizAction): Go13QuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: Go13QuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
