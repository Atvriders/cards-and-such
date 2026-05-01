import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ChemistryLabQuizSettings { questions: "10" | "20" | "30"; }
export interface ChemistryLabQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChemistryLabQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's a Bunsen burner used for?", choices: ["Heating chemicals","Stirring","Measuring volume","Filtering"], correct: 0 },
  { question: "What's a beaker?", choices: ["Cylindrical glass container with spout","Tall narrow flask","Round flask","Test tube"], correct: 0 },
  { question: "What's an Erlenmeyer flask shape?", choices: ["Conical","Round","Cylindrical","Square"], correct: 0 },
  { question: "What's a graduated cylinder used for?", choices: ["Measuring liquid volume","Heating","Mixing","Filtering"], correct: 0 },
  { question: "What's a pipette?", choices: ["Precise volume liquid transfer","Heating","Stirring","Measuring mass"], correct: 0 },
  { question: "What's a burette?", choices: ["Titration tool","Heating","Mixing","Storage"], correct: 0 },
  { question: "What's a desiccator?", choices: ["Removes moisture","Heats","Cools","Filters"], correct: 0 },
  { question: "What's litmus paper test?", choices: ["pH indicator","Temperature","Density","Mass"], correct: 0 },
  { question: "What color does litmus turn in acid?", choices: ["Red","Blue","Green","Yellow"], correct: 0 },
  { question: "What color does litmus turn in base?", choices: ["Blue","Red","Green","Yellow"], correct: 0 },
  { question: "What's a centrifuge for?", choices: ["Separating mixtures by density","Heating","Filtering","Mixing"], correct: 0 },
  { question: "What's a fume hood?", choices: ["Ventilated cabinet for hazardous chemicals","Heating area","Storage","Mixing area"], correct: 0 },
  { question: "What's PPE in lab?", choices: ["Personal Protective Equipment","Pipette","Beaker tools","All gear"], correct: 0 },
  { question: "What's required eye PPE?", choices: ["Safety goggles","Glasses","Both","Mask"], correct: 2 },
  { question: "What's an MSDS?", choices: ["Material Safety Data Sheet (now SDS)","Lab manual","Equipment guide","Reagent list"], correct: 0 },
  { question: "What's a meniscus?", choices: ["Curve of liquid in cylinder","Bubble","Just water","Foam"], correct: 0 },
  { question: "How do you read a meniscus?", choices: ["At eye level, bottom of curve for water","Top","From above","From below"], correct: 0 },
  { question: "What's distilled water?", choices: ["Pure water with no minerals","Tap","Both","Bottled"], correct: 0 },
  { question: "What's titration?", choices: ["Adding measured volume to find concentration","Heating","Filtering","Mixing"], correct: 0 },
  { question: "What's a chemical indicator?", choices: ["Substance changing color with chemical change","Test paper","Both","Just paper"], correct: 2 },
  { question: "What's filtration?", choices: ["Separating solid from liquid","Heating","Mixing","Distilling"], correct: 0 },
  { question: "What's distillation?", choices: ["Boiling and condensing to separate","Filtering","Mixing","Centrifuging"], correct: 0 },
  { question: "What's chromatography?", choices: ["Separating mixtures by movement through medium","Filtering","Boiling","Just separation"], correct: 0 },
  { question: "What's a hot plate used for?", choices: ["Heating without flame","Stirring only","Cooling","Storage"], correct: 0 },
  { question: "What's a magnetic stirrer?", choices: ["Mixes liquid using magnet","Heats","Cools","Filters"], correct: 0 },
  { question: "What's a stoichiometric ratio?", choices: ["Mole ratio between reactants/products","Just ratio","Both","Just chemistry"], correct: 2 },
  { question: "What's the universal solvent?", choices: ["Water","Ethanol","Acetone","Hexane"], correct: 0 },
  { question: "What's a precipitate?", choices: ["Insoluble solid forming in liquid","Solution","Both","Just liquid"], correct: 0 },
  { question: "What's an exothermic reaction?", choices: ["Releases heat","Absorbs heat","Just hot","Just cool"], correct: 0 },
  { question: "What's an endothermic reaction?", choices: ["Absorbs heat","Releases heat","Both","Just hot"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ChemistryLabQuizSettings): ChemistryLabQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ChemistryLabQuizState, action: ChemistryLabQuizAction): ChemistryLabQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ChemistryLabQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
