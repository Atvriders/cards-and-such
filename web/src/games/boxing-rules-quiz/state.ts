import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BoxingRulesQuizSettings { questions: "10" | "20"; }
export interface BoxingRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BoxingRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How long is a standard professional boxing round?", choices: ["2 min", "3 min", "4 min", "5 min"], correct: 1 },
  { question: "How long is the rest between rounds?", choices: ["30 sec", "45 sec", "1 min", "90 sec"], correct: 2 },
  { question: "How many rounds in a championship boxing match (modern)?", choices: ["10", "12", "15", "20"], correct: 1 },
  { question: "What's the count when a downed boxer must rise?", choices: ["8", "10", "15", "20"], correct: 1 },
  { question: "What is a TKO?", choices: ["Technical Knock Out", "Total Knock Out", "Tournament Knock Out", "Tactical Knock Out"], correct: 0 },
  { question: "How many judges score a typical professional fight?", choices: ["1", "3", "5", "7"], correct: 1 },
  { question: "What scoring system do most pro fights use?", choices: ["10-point must", "5-point must", "20-point must", "Round wins"], correct: 0 },
  { question: "Which area is illegal to punch?", choices: ["Below belt", "Back of the head", "Both of those", "Chest"], correct: 2 },
  { question: "Which weight class is heaviest in boxing?", choices: ["Heavyweight", "Cruiserweight", "Super heavyweight", "Lightweight"], correct: 0 },
  { question: "What does 'split decision' mean?", choices: ["Judges disagree on winner", "Boxer drops weight", "Referee stops fight", "Round split"], correct: 0 },
  { question: "Which is illegal in boxing?", choices: ["Hooks", "Jabs", "Headbutts", "Uppercuts"], correct: 2 },
  { question: "Olympic boxing rounds in 2020 are?", choices: ["3 x 3 min", "4 x 2 min", "5 x 2 min", "12 x 3 min"], correct: 0 },
  { question: "Headgear in Olympic men's boxing was removed when?", choices: ["2012", "2016", "2020", "2024"], correct: 1 },
  { question: "How many ounces is a standard heavyweight boxing glove?", choices: ["6 oz", "8 oz", "10 oz", "Often 10 oz pro"], correct: 3 },
  { question: "Boxing originated as an Olympic sport in?", choices: ["Ancient Greece", "Renaissance Italy", "Modern London", "Ancient Egypt"], correct: 0 },
  { question: "Which decision happens when judges' scores can't determine clear winner?", choices: ["Draw", "TKO", "DQ", "No contest"], correct: 0 },
  { question: "What is a 'standing eight count'?", choices: ["Ref pauses to assess injured boxer standing", "Knockout count", "Round count", "Time-out"], correct: 0 },
  { question: "What weight defines flyweight?", choices: ["~52 kg / 112 lb", "~70 kg", "~85 kg", "~100 kg"], correct: 0 },
  { question: "How are points awarded for a clean punch in amateur?", choices: ["1 per punch judges count", "10 minus deductions", "Aggregate of judges' subjective scoring", "Knockdown only"], correct: 2 },
  { question: "Which is the most prestigious belt sanctioned by major bodies?", choices: ["WBA, WBC, WBO, IBF unified", "Golden Gloves", "Olympic gold", "Local titles"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BoxingRulesQuizSettings): BoxingRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BoxingRulesQuizState, action: BoxingRulesQuizAction): BoxingRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BoxingRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
