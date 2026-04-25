import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface PlanetsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type PlanetsQuizAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" };
export interface PlanetsQuizSettings { questions: "10"|"20" }
const ALL_QUESTIONS: QuizQuestion[] = [
  { question:"Which is the largest planet in our solar system?", choices:["Saturn","Uranus","Neptune","Jupiter"], correct:3 },
  { question:"Which planet is known as the Red Planet?", choices:["Venus","Mars","Mercury","Jupiter"], correct:1 },
  { question:"How many moons does Earth have?", choices:["0","1","2","3"], correct:1 },
  { question:"Which planet has the most moons?", choices:["Saturn","Jupiter","Uranus","Neptune"], correct:0 },
  { question:"Which planet spins on its side (extreme axial tilt)?", choices:["Neptune","Saturn","Pluto","Uranus"], correct:3 },
  { question:"What is the hottest planet in our solar system?", choices:["Mercury","Mars","Venus","Jupiter"], correct:2 },
  { question:"Which planet has the Great Red Spot?", choices:["Saturn","Neptune","Mars","Jupiter"], correct:3 },
  { question:"How long is a day on Venus compared to its year?", choices:["Shorter","Equal","Longer","Half"], correct:2 },
  { question:"Which is the smallest planet in our solar system?", choices:["Mars","Pluto","Mercury","Venus"], correct:2 },
  { question:"Saturn's rings are made primarily of?", choices:["Gas","Dust only","Rock and metal","Ice and rock"], correct:3 },
  { question:"Which planet is farthest from the Sun?", choices:["Saturn","Uranus","Neptune","Pluto"], correct:2 },
  { question:"Mars has how many moons?", choices:["0","1","2","4"], correct:2 },
  { question:"Which planet has a storm called the Great Dark Spot?", choices:["Uranus","Jupiter","Neptune","Saturn"], correct:2 },
  { question:"What is the closest planet to the Sun?", choices:["Venus","Earth","Mars","Mercury"], correct:3 },
  { question:"Jupiter is made primarily of?", choices:["Rock and metal","Water ice","Hydrogen and helium","Carbon dioxide"], correct:2 },
  { question:"Which planet has the shortest day (fastest rotation)?", choices:["Saturn","Neptune","Jupiter","Mars"], correct:2 },
  { question:"How many planets are in our solar system?", choices:["7","8","9","10"], correct:1 },
  { question:"Which spacecraft first reached interstellar space?", choices:["Voyager 2","Pioneer 10","New Horizons","Voyager 1"], correct:3 },
  { question:"Titan is the largest moon of which planet?", choices:["Jupiter","Neptune","Uranus","Saturn"], correct:3 },
  { question:"The Mariner Valleys (Valles Marineris) are on which planet?", choices:["Venus","Jupiter","Mars","Mercury"], correct:2 },
];
function shuffle<T>(arr: T[], rng: ()=>number): T[] { const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PlanetsQuizSettings): PlanetsQuizState {
  const rng=mulberry32(seed);const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const indexed=q.choices.map((c,i)=>({c,i}));const sh=shuffle(indexed,rng);const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};});
  return { questions, currentIndex:0, selected:null, submitted:false, score:0, correctCount:0, phase:"playing" };
}
export function reducer(state: PlanetsQuizState, action: PlanetsQuizAction): PlanetsQuizState {
  if(state.phase==="done") return state;
  switch(action.type){
    case "select": return state.submitted?state:{...state,selected:action.choice};
    case "submit": {if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;return{...state,submitted:true,score:state.score+(ok?100:0),correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case "next": {const next=state.currentIndex+1;if(next>=state.questions.length)return{...state,phase:"done"};return{...state,currentIndex:next,selected:null,submitted:false,phase:"playing"};}
    default: return state;
  }
}
export function isTerminal(state: PlanetsQuizState): { score:number }|null { return state.phase==="done"?{score:state.score}:null; }
