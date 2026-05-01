import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface LostShowSettings { questions: "10" | "20" | "30"; }
export interface LostShowState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type LostShowAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What network aired Lost?", choices: ["ABC","NBC","CBS","HBO"], correct: 0 },
  { question: "Who co-created Lost?", choices: ["J.J. Abrams","Vince Gilligan","David Chase","Damon Lindelof and J.J. Abrams"], correct: 0 },
  { question: "What flight crashes on the island?", choices: ["Oceanic 815","Pan Am 103","Ajira 316","Oceanic 6"], correct: 0 },
  { question: "Who plays Jack Shephard?", choices: ["Matthew Fox","Josh Holloway","Naveen Andrews","Dominic Monaghan"], correct: 0 },
  { question: "Who plays Kate Austen?", choices: ["Evangeline Lilly","Yunjin Kim","Maggie Grace","Emilie de Ravin"], correct: 0 },
  { question: "Who plays Sawyer (James Ford)?", choices: ["Josh Holloway","Matthew Fox","Naveen Andrews","Jorge Garcia"], correct: 0 },
  { question: "Who plays John Locke?", choices: ["Terry O'Quinn","Michael Emerson","Jorge Garcia","Naveen Andrews"], correct: 0 },
  { question: "Who plays Hurley (Hugo Reyes)?", choices: ["Jorge Garcia","Daniel Dae Kim","Naveen Andrews","Harold Perrineau"], correct: 0 },
  { question: "Who plays Sayid Jarrah?", choices: ["Naveen Andrews","Daniel Dae Kim","Jorge Garcia","Adewale Akinnuoye-Agbaje"], correct: 0 },
  { question: "Who plays Jin-Soo Kwon?", choices: ["Daniel Dae Kim","Naveen Andrews","Ken Leung","Jorge Garcia"], correct: 0 },
  { question: "Who plays Sun-Hwa Kwon?", choices: ["Yunjin Kim","Maggie Grace","Evangeline Lilly","Tania Raymonde"], correct: 0 },
  { question: "What is the name of Hurley's lottery curse number sequence?", choices: ["4 8 15 16 23 42","1 2 3 4 5 6","7 14 21 28 35 42","4 16 23 8 15 42"], correct: 0 },
  { question: "Who is the leader of the Others (most prominently)?", choices: ["Benjamin Linus","Jacob","Charles Widmore","Richard Alpert"], correct: 0 },
  { question: "Who plays Ben Linus?", choices: ["Michael Emerson","Terry O'Quinn","Henry Ian Cusick","Nestor Carbonella"], correct: 0 },
  { question: "What is the name of the underground bunker discovered in Season 2?", choices: ["The Hatch (Swan Station)","The Pearl","The Orchid","The Flame"], correct: 0 },
  { question: "What organization built the stations on the island?", choices: ["DHARMA Initiative","Hanso Foundation Direct","Widmore Industries","Mittelos Bioscience"], correct: 0 },
  { question: "Who plays Charlie Pace?", choices: ["Dominic Monaghan","Naveen Andrews","Matthew Fox","Josh Holloway"], correct: 0 },
  { question: "What band was Charlie in?", choices: ["Drive Shaft","The Others","Oceanic","The Hatch"], correct: 0 },
  { question: "Catchphrase: 'You all everybody' is from which song?", choices: ["Drive Shaft","Africa","Make Your Own Kind","Downtown"], correct: 0 },
  { question: "Who is Jacob's brother (the Man in Black)?", choices: ["Played by Titus Welliver","Played by Michael Emerson","Played by Mark Pellegrino","Played by Henry Ian Cusick"], correct: 0 },
  { question: "Who plays Jacob?", choices: ["Mark Pellegrino","Titus Welliver","Michael Emerson","Henry Ian Cusick"], correct: 0 },
  { question: "What is Desmond's Scottish catchphrase?", choices: ["See you in another life, brother","Live together, die alone","Don't tell me what I can't do","Namaste"], correct: 0 },
  { question: "Who plays Desmond Hume?", choices: ["Henry Ian Cusick","Naveen Andrews","Dominic Monaghan","Matthew Fox"], correct: 0 },
  { question: "What number must be entered into the computer in the Hatch?", choices: ["The numbers 4 8 15 16 23 42","1234567","000000","42"], correct: 0 },
  { question: "How often must the Hatch numbers be entered?", choices: ["Every 108 minutes","Every hour","Every 60 minutes","Every 90 minutes"], correct: 0 },
  { question: "Who is Walt's father?", choices: ["Michael","Locke","Jack","Sawyer"], correct: 0 },
  { question: "What does the smoke monster turn out to be?", choices: ["The Man in Black","An alien","A weather phenomenon","DHARMA tech"], correct: 0 },
  { question: "How many seasons does Lost have?", choices: ["6","5","7","8"], correct: 0 },
  { question: "What word does John Locke say repeatedly with conviction?", choices: ["Don't tell me what I can't do","Namaste","See you later","Live together"], correct: 0 },
  { question: "Where does the show end (in the flash-sideways)?", choices: ["A church","A library","An airport","A beach"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: LostShowSettings): LostShowState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: LostShowState, action: LostShowAction): LostShowState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: LostShowState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
