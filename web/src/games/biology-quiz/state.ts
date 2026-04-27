import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BiologyQuizSettings { questions: "10" | "20" | "30"; }
export interface BiologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BiologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is the basic unit of life?", choices: ["Atom", "Cell", "Molecule", "Organ"], correct: 1 },
  { question: "Who proposed natural selection?", choices: ["Mendel", "Darwin", "Watson", "Crick"], correct: 1 },
  { question: "What does DNA stand for?", choices: ["Deoxyribonucleic acid", "Diaminonucleic acid", "Dinitrogenacid", "Decanucleic acid"], correct: 0 },
  { question: "Which organelle produces energy in cells?", choices: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"], correct: 2 },
  { question: "What process do plants use to make food?", choices: ["Respiration", "Photosynthesis", "Digestion", "Fermentation"], correct: 1 },
  { question: "How many chromosomes do humans have?", choices: ["23", "46", "48", "92"], correct: 1 },
  { question: "Who discovered the structure of DNA?", choices: ["Mendel", "Darwin", "Watson and Crick", "Rosalind Franklin alone"], correct: 2 },
  { question: "Mitosis produces?", choices: ["4 gametes", "2 identical cells", "Sex cells", "RNA"], correct: 1 },
  { question: "Which scientist is the father of genetics?", choices: ["Darwin", "Mendel", "Pasteur", "Linnaeus"], correct: 1 },
  { question: "What is the powerhouse of the cell?", choices: ["Mitochondria", "Ribosome", "Golgi", "Nucleus"], correct: 0 },
  { question: "What kingdom do mushrooms belong to?", choices: ["Plantae", "Fungi", "Protista", "Animalia"], correct: 1 },
  { question: "What is the largest organ of the human body?", choices: ["Liver", "Skin", "Brain", "Lungs"], correct: 1 },
  { question: "Genes are made of?", choices: ["RNA", "DNA", "Protein", "Lipids"], correct: 1 },
  { question: "What process is meiosis?", choices: ["Cell division for growth", "Sex cell formation", "Energy production", "Protein synthesis"], correct: 1 },
  { question: "Which scientist developed the rabies vaccine?", choices: ["Pasteur", "Fleming", "Koch", "Salk"], correct: 0 },
  { question: "What is biodiversity?", choices: ["Variety of life", "Number of species", "Genetic variation", "All of the above"], correct: 3 },
  { question: "What is an ecosystem?", choices: ["Animals only", "Plants only", "Living + non-living interacting", "Only food webs"], correct: 2 },
  { question: "What animal group are humans in?", choices: ["Reptiles", "Birds", "Mammals", "Amphibians"], correct: 2 },
  { question: "Photosynthesis produces?", choices: ["CO2 + water", "Glucose + oxygen", "Nitrogen", "Methane"], correct: 1 },
  { question: "What is RNA's role?", choices: ["DNA replication", "Protein synthesis", "Cell division", "Energy production"], correct: 1 },
  { question: "Which biologist coined the term 'cell'?", choices: ["Hooke", "Pasteur", "Linnaeus", "Mendel"], correct: 0 },
  { question: "Which of these is a producer?", choices: ["Tiger", "Eagle", "Tree", "Mushroom"], correct: 2 },
  { question: "Carl Linnaeus is famous for?", choices: ["Evolution theory", "Taxonomy", "Genetics", "Vaccines"], correct: 1 },
  { question: "Where does aerobic respiration occur?", choices: ["Nucleus", "Ribosome", "Mitochondria", "ER"], correct: 2 },
  { question: "What is a vertebrate?", choices: ["Animal with backbone", "Animal without backbone", "Plant", "Fungus"], correct: 0 },
  { question: "What human chromosome pair determines sex?", choices: ["Pair 1", "Pair 13", "Pair 21", "Pair 23"], correct: 3 },
  { question: "Which organism causes most malaria infections?", choices: ["Bacteria", "Plasmodium parasite", "Virus", "Worm"], correct: 1 },
  { question: "What is symbiosis?", choices: ["Predation", "Living together", "Migration", "Competition"], correct: 1 },
  { question: "What domain are bacteria in?", choices: ["Eukarya", "Bacteria", "Archaea", "Protista"], correct: 1 },
  { question: "Which scientist discovered penicillin?", choices: ["Pasteur", "Fleming", "Salk", "Crick"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BiologyQuizSettings): BiologyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BiologyQuizState, action: BiologyQuizAction): BiologyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BiologyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
