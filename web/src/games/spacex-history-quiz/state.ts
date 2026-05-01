import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SpacexHistoryQuizSettings { questions: "10" | "20" | "30"; }
export interface SpacexHistoryQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SpacexHistoryQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "SpaceX was founded in what year?", choices: ["2000","2002","2004","2006"], correct: 1 },
  { question: "Who founded SpaceX?", choices: ["Jeff Bezos","Elon Musk","Richard Branson","Paul Allen"], correct: 1 },
  { question: "SpaceX is headquartered in which city?", choices: ["Boca Chica, TX","Hawthorne, CA","Cape Canaveral, FL","McGregor, TX"], correct: 1 },
  { question: "Which was SpaceX's first orbital rocket?", choices: ["Falcon 1","Falcon 9","Starship","Falcon Heavy"], correct: 0 },
  { question: "In what year did Falcon 1 first reach orbit?", choices: ["2006","2007","2008","2009"], correct: 2 },
  { question: "Which company became the first private firm to dock with the ISS?", choices: ["Boeing","SpaceX","Northrop Grumman","Sierra Space"], correct: 1 },
  { question: "SpaceX's cargo capsule is called?", choices: ["Dragon","Cygnus","Starliner","Orion"], correct: 0 },
  { question: "SpaceX's crewed capsule is called?", choices: ["Dragon 2 / Crew Dragon","Starliner","Orion","Soyuz"], correct: 0 },
  { question: "Crew Dragon Demo-2 launched NASA astronauts in what year?", choices: ["2018","2019","2020","2021"], correct: 2 },
  { question: "Who were the two NASA astronauts on Demo-2?", choices: ["Hurley & Behnken","Glover & Hopkins","Kimbrough & Pesquet","Mann & Cassada"], correct: 0 },
  { question: "The Falcon Heavy first launched successfully in what year?", choices: ["2016","2017","2018","2019"], correct: 2 },
  { question: "What payload was launched on the first Falcon Heavy test flight?", choices: ["Tesla Roadster","Cybertruck","Dummy satellite","TESS telescope"], correct: 0 },
  { question: "SpaceX first landed an orbital booster vertically in what year?", choices: ["2013","2014","2015","2016"], correct: 2 },
  { question: "The Merlin engine is used on which rocket?", choices: ["Falcon 9","Starship","New Glenn","Atlas V"], correct: 0 },
  { question: "Starship's main engine is called?", choices: ["Merlin","Raptor","BE-4","RS-25"], correct: 1 },
  { question: "Starship is being developed at which SpaceX site?", choices: ["Kennedy Space Center","Boca Chica/Starbase","Vandenberg","Hawthorne"], correct: 1 },
  { question: "Starship's first integrated flight test occurred in what year?", choices: ["2021","2022","2023","2024"], correct: 2 },
  { question: "Starlink is SpaceX's?", choices: ["Crew vehicle","Satellite internet constellation","Mars colony","Launch pad"], correct: 1 },
  { question: "First Starlink satellites launched in what year?", choices: ["2017","2018","2019","2020"], correct: 2 },
  { question: "Inspiration4, the first all-civilian orbital mission, flew in?", choices: ["2020","2021","2022","2023"], correct: 1 },
  { question: "The Inspiration4 mission was commanded by?", choices: ["Yusaku Maezawa","Jared Isaacman","Richard Branson","Hayley Arceneaux"], correct: 1 },
  { question: "Polaris Dawn featured the first commercial spacewalk in?", choices: ["2022","2023","2024","2025"], correct: 2 },
  { question: "Falcon 9 booster stages are reused after landing on?", choices: ["Helicopter nets","Drone ships and ground pads","Parachutes only","Submarines"], correct: 1 },
  { question: "SpaceX's autonomous drone ship 'Of Course I Still Love You' is named after?", choices: ["A Star Wars ship","An Iain M. Banks Culture ship","A Star Trek ship","A 2001: Space Odyssey ship"], correct: 1 },
  { question: "How many Merlin engines does Falcon 9's first stage use?", choices: ["5","7","9","11"], correct: 2 },
  { question: "How many engines power the Super Heavy booster (approx)?", choices: ["13","23","27","33"], correct: 3 },
  { question: "Gwynne Shotwell is SpaceX's?", choices: ["Chief Engineer","President & COO","CFO","Lead Astronaut"], correct: 1 },
  { question: "SpaceX's Mars exploration goal is centered around what vehicle?", choices: ["Falcon Heavy","Starship","Dragon XL","Red Dragon"], correct: 1 },
  { question: "In 2024 SpaceX caught the Super Heavy booster using?", choices: ["Parachutes","'Mechazilla' chopstick arms","A floating barge","A net ship"], correct: 1 },
  { question: "SpaceX's first commercial customer-paid Falcon 1 mission was in?", choices: ["2008","2009","2010","2011"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SpacexHistoryQuizSettings): SpacexHistoryQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SpacexHistoryQuizState, action: SpacexHistoryQuizAction): SpacexHistoryQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SpacexHistoryQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
