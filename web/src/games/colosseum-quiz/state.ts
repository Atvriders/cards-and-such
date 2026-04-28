import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ColosseumQuizSettings { questions: "10" | "20"; }
export interface ColosseumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ColosseumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is the Colosseum located?", choices: ["Athens", "Rome", "Naples", "Florence"], correct: 1 },
  { question: "What was the Colosseum's original name?", choices: ["Flavian Amphitheatre", "Vespasian's Stadium", "Roman Coliseum", "Augustus Arena"], correct: 0 },
  { question: "When was the Colosseum completed?", choices: ["50 BC", "AD 80", "AD 200", "AD 500"], correct: 1 },
  { question: "Which emperor began the Colosseum's construction?", choices: ["Vespasian", "Nero", "Augustus", "Caligula"], correct: 0 },
  { question: "How many spectators could the Colosseum hold?", choices: ["~5,000", "~25,000", "~50,000", "~100,000"], correct: 2 },
  { question: "What was the primary purpose of the Colosseum?", choices: ["Religious rituals", "Gladiatorial games and spectacles", "Senate meetings", "Markets"], correct: 1 },
  { question: "What were the floors below the arena called?", choices: ["Hypogeum", "Crypta", "Catacomb", "Forum"], correct: 0 },
  { question: "What spectacle could the Colosseum host with flooding?", choices: ["Chariot races", "Naumachiae (mock naval battles)", "Operas", "Marriages"], correct: 1 },
  { question: "What material is the Colosseum primarily built from?", choices: ["Marble", "Concrete and travertine", "Brick only", "Granite"], correct: 1 },
  { question: "How tall is the Colosseum?", choices: ["~30m", "~48m", "~80m", "~150m"], correct: 1 },
  { question: "Which dynasty built the Colosseum?", choices: ["Julio-Claudian", "Flavian", "Antonine", "Severan"], correct: 1 },
  { question: "How many entrances did the Colosseum have?", choices: ["4", "20", "80 (76 numbered)", "200"], correct: 2 },
  { question: "What was a velarium?", choices: ["Sail/awning to shade spectators", "Gladiator", "Animal pen", "Cooking area"], correct: 0 },
  { question: "Which famous emperor is alleged to have fought as a gladiator?", choices: ["Trajan", "Commodus", "Hadrian", "Marcus Aurelius"], correct: 1 },
  { question: "In what year was the Colosseum named a New 7 Wonder?", choices: ["2000", "2007", "2015", "2020"], correct: 1 },
  { question: "What damage caused major sections of the Colosseum to fall?", choices: ["Earthquakes", "Roman wars", "Volcanic eruptions", "Sand storms"], correct: 0 },
  { question: "What is the floor of the Colosseum made of (modern partial reconstruction)?", choices: ["Wooden boards over hypogeum", "Marble", "Stone slabs", "Sand only"], correct: 0 },
  { question: "How is gladiator combat ended traditionally?", choices: ["First blood", "Crowd's sign and emperor's gesture", "20-minute time", "Knockout"], correct: 1 },
  { question: "Approximately how long were gladiator games held there?", choices: ["50 years", "100 years", "Over 350 years", "1,000 years"], correct: 2 },
  { question: "How many days/year were games held in the Colosseum?", choices: ["~10", "~30", "~70+", "~365"], correct: 2 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ColosseumQuizSettings): ColosseumQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ColosseumQuizState, action: ColosseumQuizAction): ColosseumQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ColosseumQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
