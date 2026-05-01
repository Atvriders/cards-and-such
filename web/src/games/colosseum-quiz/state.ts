import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ColosseumQuizSettings { questions: "10" | "20"; }
export interface ColosseumQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ColosseumQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is the Colosseum located?", choices: ["Rome", "Athens", "Naples", "Florence"], correct: 0 },
  { question: "Original name of the Colosseum?", choices: ["Flavian Amphitheatre", "Domus Aurea", "Forum Romanum", "Pantheon"], correct: 0 },
  { question: "Year construction began?", choices: ["50 BCE", "72 CE", "200 CE", "400 CE"], correct: 1 },
  { question: "Emperor who began it?", choices: ["Nero", "Vespasian", "Hadrian", "Constantine"], correct: 1 },
  { question: "Emperor who inaugurated it?", choices: ["Titus", "Domitian", "Trajan", "Augustus"], correct: 0 },
  { question: "Inaugural games lasted how long?", choices: ["1 day", "10 days", "100 days", "1 year"], correct: 2 },
  { question: "Approximate seating capacity?", choices: ["5,000", "20,000", "50,000", "200,000"], correct: 2 },
  { question: "Main material of the Colosseum?", choices: ["Travertine & concrete", "Marble only", "Wood", "Brick only"], correct: 0 },
  { question: "Floor of the arena was covered with?", choices: ["Marble", "Sand (harena)", "Grass", "Stone tiles"], correct: 1 },
  { question: "Underground network beneath the floor?", choices: ["Hypogeum", "Atrium", "Cavea", "Forum"], correct: 0 },
  { question: "Who fought as armed performers?", choices: ["Senators", "Gladiators", "Priests", "Merchants"], correct: 1 },
  { question: "'Velarium' was a?", choices: ["Sword", "Shade awning", "Banner", "Door"], correct: 1 },
  { question: "Ground level seating was for?", choices: ["Plebs", "Senators/Vestals", "Slaves", "Soldiers"], correct: 1 },
  { question: "Sea battle reenactments were called?", choices: ["Naumachiae", "Triumphs", "Ludi", "Saturnalia"], correct: 0 },
  { question: "Number of arched entrances?", choices: ["20", "40", "80", "160"], correct: 2 },
  { question: "Tallest dimension of the Colosseum?", choices: ["~25 m", "~50 m", "~100 m", "~200 m"], correct: 1 },
  { question: "Major damage source over the centuries?", choices: ["Volcano", "Earthquakes", "Floods", "Tsunamis"], correct: 1 },
  { question: "Stone from the Colosseum was reused for?", choices: ["St. Peter's & palaces", "Pantheon", "Aqueducts", "Coliseum II"], correct: 0 },
  { question: "Final official games held around?", choices: ["100 CE", "250 CE", "435 CE", "700 CE"], correct: 2 },
  { question: "Christian symbol added by Pope Benedict XIV?", choices: ["Cross", "Bell tower", "Statue", "Altar"], correct: 0 },
  { question: "Modern preservation work began in?", choices: ["1900s", "1800s", "1700s", "1500s"], correct: 1 },
  { question: "Colosseum is part of Rome's UNESCO site since?", choices: ["1980", "1990", "2000", "2010"], correct: 0 },
  { question: "Annual visitors to the Colosseum (approx)?", choices: ["~50,000", "~7 million", "~25 million", "~100 million"], correct: 1 },
  { question: "Famous gladiator class with a trident?", choices: ["Murmillo", "Retiarius", "Thraex", "Hoplomachus"], correct: 1 },
  { question: "Iconic shield-and-sword class?", choices: ["Murmillo", "Retiarius", "Auxiliary", "Velite"], correct: 0 },
  { question: "Animals fought in the Colosseum included?", choices: ["Elephants", "Lions", "Bears", "All of these"], correct: 3 },
  { question: "Movie Gladiator (2000) won how many Oscars?", choices: ["1", "3", "5", "10"], correct: 2 },
  { question: "Estimated humans who died in arena games (Roman empire)?", choices: ["Hundreds", "Thousands", "Hundreds of thousands", "Millions"], correct: 2 },
  { question: "Wonder list naming Colosseum a 'New 7 Wonders'?", choices: ["UNESCO 1970", "Swiss vote 2007", "UN 1990", "EU 2000"], correct: 1 },
  { question: "Modern Italian name?", choices: ["Colosseo", "Colossale", "Colossi", "Colombo"], correct: 0 }
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
