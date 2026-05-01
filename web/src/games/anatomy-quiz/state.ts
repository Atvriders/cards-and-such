import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnatomyQuizSettings { questions: "10" | "20" | "30"; }
export interface AnatomyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnatomyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many bones are in the adult human body?", choices: ["206","200","220","250"], correct: 0 },
  { question: "How many muscles are in the human body (approx)?", choices: ["~600","~400","~800","~200"], correct: 0 },
  { question: "What's the longest bone?", choices: ["Femur","Tibia","Humerus","Ulna"], correct: 0 },
  { question: "What's the smallest bone?", choices: ["Stapes (in ear)","Pisiform","Trapezium","Pinky finger"], correct: 0 },
  { question: "How many chambers does the heart have?", choices: ["4","2","3","6"], correct: 0 },
  { question: "What's the largest artery?", choices: ["Aorta","Pulmonary","Vena cava (vein)","Femoral"], correct: 0 },
  { question: "What's the largest vein?", choices: ["Vena cava","Aorta","Pulmonary","Jugular"], correct: 0 },
  { question: "How many lobes does the right lung have?", choices: ["3","2","4","5"], correct: 0 },
  { question: "How many lobes does the left lung have?", choices: ["2","3","4","5"], correct: 0 },
  { question: "What organ filters blood and produces urine?", choices: ["Kidney","Liver","Spleen","Pancreas"], correct: 0 },
  { question: "What's the largest internal organ?", choices: ["Liver","Heart","Brain","Lungs"], correct: 0 },
  { question: "How many teeth do adults have?", choices: ["32","28","30","36"], correct: 0 },
  { question: "What's the largest joint?", choices: ["Knee","Hip","Shoulder","Elbow"], correct: 0 },
  { question: "What's the largest muscle?", choices: ["Gluteus maximus","Quadriceps","Latissimus","Trapezius"], correct: 0 },
  { question: "What's the strongest muscle by force?", choices: ["Masseter (jaw) by some measures","Heart by endurance","Both depending","Quad"], correct: 0 },
  { question: "Where's the cerebellum?", choices: ["Back of brain (controls coordination)","Front","Top","Just brain"], correct: 2 },
  { question: "What part of brain controls thought?", choices: ["Cerebrum","Cerebellum","Brainstem","All"], correct: 0 },
  { question: "What's the spine made of?", choices: ["Vertebrae","Just bone","Both","Cartilage"], correct: 2 },
  { question: "How many vertebrae?", choices: ["33 (adult, some fused)","26 (functional)","Both","30"], correct: 2 },
  { question: "What separates chest and abdomen?", choices: ["Diaphragm","Ribs","Both","Sternum"], correct: 0 },
  { question: "What's the longest nerve?", choices: ["Sciatic","Vagus","Median","Femoral"], correct: 0 },
  { question: "What organ produces insulin?", choices: ["Pancreas","Liver","Kidney","Stomach"], correct: 0 },
  { question: "What's the function of the spleen?", choices: ["Filters blood, immune","Digestion","Endocrine","Excretion"], correct: 0 },
  { question: "What's the small intestine's role?", choices: ["Most nutrient absorption","Water reabsorption","Both","Just digestion"], correct: 0 },
  { question: "What's the large intestine's role?", choices: ["Water absorption, waste compaction","Most nutrient","Both","Just storage"], correct: 0 },
  { question: "How long is the small intestine (approx)?", choices: ["~6 meters","~1 meter","~10 meters","~3 meters"], correct: 0 },
  { question: "What gland is at the base of brain?", choices: ["Pituitary","Thyroid","Adrenal","Pineal"], correct: 0 },
  { question: "Where's thyroid?", choices: ["Neck (front)","Chest","Belly","Brain"], correct: 0 },
  { question: "How many ribs do humans have?", choices: ["24 (12 pairs)","22","26","20"], correct: 0 },
  { question: "What's the breastbone called?", choices: ["Sternum","Clavicle","Scapula","Sacrum"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AnatomyQuizSettings): AnatomyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AnatomyQuizState, action: AnatomyQuizAction): AnatomyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AnatomyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
