import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BiologyQuizSettings { questions: "10" | "20" | "30"; }
export interface BiologyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BiologyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's the basic unit of life?", choices: ["Cell","Atom","Molecule","DNA"], correct: 0 },
  { question: "What's DNA?", choices: ["Genetic material","Protein","Lipid","Sugar"], correct: 0 },
  { question: "What does DNA stand for?", choices: ["Deoxyribonucleic acid","Just DNA","Both","Different name"], correct: 2 },
  { question: "How many chromosomes do humans have?", choices: ["46","48","42","44"], correct: 0 },
  { question: "What are the four DNA bases?", choices: ["A T C G","A U C G","A T C U","Different"], correct: 0 },
  { question: "What replaced T in RNA?", choices: ["Uracil","Adenine","Cytosine","Guanine"], correct: 0 },
  { question: "Who discovered DNA's double helix?", choices: ["Watson and Crick (with Franklin's data)","Just Watson","Just Crick","Just Franklin"], correct: 0 },
  { question: "What's mitosis?", choices: ["Cell division for growth","Sexual reproduction","Just cell death","Just division"], correct: 0 },
  { question: "What's meiosis?", choices: ["Cell division for gametes","Same as mitosis","Just division","Cell death"], correct: 0 },
  { question: "What's photosynthesis?", choices: ["Plants making sugar from sunlight, CO2, water","Just plants","Both","Animal process"], correct: 2 },
  { question: "What organelle does photosynthesis occur in?", choices: ["Chloroplast","Mitochondria","Nucleus","ER"], correct: 0 },
  { question: "What organelle is the powerhouse of the cell?", choices: ["Mitochondria","Chloroplast","Nucleus","Ribosome"], correct: 0 },
  { question: "What's the cell membrane?", choices: ["Phospholipid bilayer surrounding cell","Just membrane","Both","Cell wall"], correct: 2 },
  { question: "What's a virus?", choices: ["Non-living infectious particle","Living","Both","Bacteria"], correct: 0 },
  { question: "What are bacteria?", choices: ["Single-celled prokaryotes","Multi-celled","Just one type","Viruses"], correct: 0 },
  { question: "What's a protein?", choices: ["Made of amino acids","Sugar","Lipid","Water"], correct: 0 },
  { question: "How many amino acids are commonly used in proteins?", choices: ["20","10","30","40"], correct: 0 },
  { question: "What's the central dogma?", choices: ["DNA -> RNA -> Protein","Just DNA","Both","Different"], correct: 2 },
  { question: "What's natural selection?", choices: ["Survival/reproduction of fittest","Random mutation","Both","Just inheritance"], correct: 2 },
  { question: "Who proposed natural selection?", choices: ["Charles Darwin (and Wallace)","Just Darwin","Both","Just Wallace"], correct: 0 },
  { question: "What did Darwin write?", choices: ["On the Origin of Species","Just Origin","Both names","Different book"], correct: 2 },
  { question: "In what year was Origin of Species published?", choices: ["1859","1869","1849","1879"], correct: 0 },
  { question: "What's the largest organ in the human body?", choices: ["Skin","Liver","Brain","Heart"], correct: 0 },
  { question: "What's the largest internal organ?", choices: ["Liver","Heart","Brain","Lungs"], correct: 0 },
  { question: "How many bones in the adult human body?", choices: ["206","200","210","220"], correct: 0 },
  { question: "What's the function of red blood cells?", choices: ["Carry oxygen","Fight infection","Clot blood","Carry CO2"], correct: 0 },
  { question: "What's the function of white blood cells?", choices: ["Fight infection","Carry oxygen","Clot","Just cells"], correct: 0 },
  { question: "What's the function of platelets?", choices: ["Blood clotting","Carry oxygen","Fight infection","All"], correct: 0 },
  { question: "What's an enzyme?", choices: ["Biological catalyst (protein usually)","Just protein","Both","Just acid"], correct: 2 },
  { question: "What organisms are eukaryotes?", choices: ["Cells with nuclei (plants, animals, fungi, protists)","Just animals","Both","Just plants"], correct: 2 },
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
