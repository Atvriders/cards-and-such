import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SoccerRulesQuizSettings { questions: "10" | "20" | "30"; }
export interface SoccerRulesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SoccerRulesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players from each side are on the pitch?", choices: ["10", "11", "12", "13"], correct: 1 },
  { question: "How long is a soccer match (regulation)?", choices: ["80 minutes", "90 minutes", "100 minutes", "120 minutes"], correct: 1 },
  { question: "How many halves in a soccer match?", choices: ["2", "3", "4", "5"], correct: 0 },
  { question: "How long is each half (regulation)?", choices: ["40 minutes", "45 minutes", "50 minutes", "60 minutes"], correct: 1 },
  { question: "Distance from penalty spot to goal line?", choices: ["10 yards", "12 yards", "15 yards", "18 yards"], correct: 1 },
  { question: "Goal width?", choices: ["7 yards", "8 yards", "9 yards", "10 yards"], correct: 1 },
  { question: "Height of a soccer goal?", choices: ["7 feet", "8 feet", "9 feet", "10 feet"], correct: 1 },
  { question: "Player is offside when, at the moment the ball is played, they are?", choices: ["Behind defenders", "Past second-to-last defender in attacking half (with conditions)", "In their own half", "In the goal box"], correct: 1 },
  { question: "A red card means?", choices: ["Warning", "Yellow x2", "Send off (no replacement)", "Free kick"], correct: 2 },
  { question: "Two yellow cards in a match equal?", choices: ["A red card", "A free kick", "Offside", "Throw-in"], correct: 0 },
  { question: "Maximum substitutions allowed in most modern league matches?", choices: ["3", "5", "7", "Unlimited"], correct: 1 },
  { question: "World Cup extra time is how long?", choices: ["10 minutes", "15 minutes", "20 minutes", "30 minutes"], correct: 3 },
  { question: "Indirect free kick can score directly?", choices: ["Yes", "No, must touch another player first", "Only inside box", "Only outside box"], correct: 1 },
  { question: "When does a corner kick happen?", choices: ["Ball goes over goal-line off defender", "Ball over halfway line", "Foul in box", "Player offside"], correct: 0 },
  { question: "Throw-in occurs when?", choices: ["Ball over sideline", "Ball in goal", "Foul committed", "Offside"], correct: 0 },
  { question: "How many officials in a major match (referee + assistants + 4th)?", choices: ["2", "3", "4", "5+"], correct: 3 },
  { question: "A VAR review is initiated for which incidents?", choices: ["Any decision", "Goals, penalties, red cards, mistaken identity", "Throw-ins", "Free kicks only"], correct: 1 },
  { question: "Penalty shootout: how many shooters per side initially?", choices: ["3", "5", "7", "11"], correct: 1 },
  { question: "What does the goalkeeper do that no other player does?", choices: ["Score", "Use hands inside their own box", "Take throw-ins", "Take corners"], correct: 1 },
  { question: "Drop ball restarts play when?", choices: ["Score", "Referee stops play (e.g., injury)", "Half-time", "Goal kick"], correct: 1 },
  { question: "Length of a regulation soccer pitch?", choices: ["90-120 yards", "100-130 yards", "110-140 yards", "75-90 yards"], correct: 0 },
  { question: "Foul outside the penalty box that's a clear scoring chance can lead to?", choices: ["Yellow card", "Red card", "Throw-in", "Drop ball"], correct: 1 },
  { question: "The Laws of the Game are administered by?", choices: ["FIFA", "UEFA", "IFAB", "Concacaf"], correct: 2 },
  { question: "Goalkeeper handling pass-back from teammate's foot is?", choices: ["Allowed", "Indirect free kick", "Direct free kick", "Yellow card"], correct: 1 },
  { question: "World Cup happens every?", choices: ["2 years", "4 years", "5 years", "8 years"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SoccerRulesQuizSettings): SoccerRulesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SoccerRulesQuizState, action: SoccerRulesQuizAction): SoccerRulesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SoccerRulesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
