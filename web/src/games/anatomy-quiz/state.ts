import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AnatomyQuizSettings { questions: "10" | "20" | "30"; }
export interface AnatomyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AnatomyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many bones does an adult human have?", choices: ["186", "206", "256", "300"], correct: 1 },
  { question: "What is the largest organ of the body?", choices: ["Liver", "Brain", "Skin", "Heart"], correct: 2 },
  { question: "How many chambers does a human heart have?", choices: ["2", "3", "4", "5"], correct: 2 },
  { question: "Where is the smallest bone in the body located?", choices: ["Foot", "Ear", "Hand", "Nose"], correct: 1 },
  { question: "What organ produces insulin?", choices: ["Liver", "Pancreas", "Kidney", "Spleen"], correct: 1 },
  { question: "How many lungs does a human have?", choices: ["1", "2", "3", "4"], correct: 1 },
  { question: "What is the longest bone in the human body?", choices: ["Tibia", "Humerus", "Femur", "Radius"], correct: 2 },
  { question: "Where are red blood cells produced?", choices: ["Liver", "Bone marrow", "Spleen", "Heart"], correct: 1 },
  { question: "What is the function of the cerebellum?", choices: ["Vision", "Balance and coordination", "Speech", "Hearing"], correct: 1 },
  { question: "Which blood vessels carry blood away from the heart?", choices: ["Veins", "Arteries", "Capillaries", "Lymph"], correct: 1 },
  { question: "What is the largest internal organ?", choices: ["Brain", "Heart", "Liver", "Lungs"], correct: 2 },
  { question: "How many teeth does a typical adult have?", choices: ["28", "30", "32", "34"], correct: 2 },
  { question: "Which is part of the digestive system?", choices: ["Trachea", "Liver", "Bronchi", "Aorta"], correct: 1 },
  { question: "What is the spine made of (segments)?", choices: ["Femurs", "Vertebrae", "Tendons", "Cartilage"], correct: 1 },
  { question: "What carries oxygen in the blood?", choices: ["Plasma", "Hemoglobin", "Platelets", "Lymphocytes"], correct: 1 },
  { question: "Which gland is the master gland?", choices: ["Thyroid", "Pituitary", "Adrenal", "Parathyroid"], correct: 1 },
  { question: "Which is part of the central nervous system?", choices: ["Spinal cord", "Sciatic nerve", "Vagus nerve", "Median nerve"], correct: 0 },
  { question: "How many pairs of ribs do humans typically have?", choices: ["10", "11", "12", "13"], correct: 2 },
  { question: "What part of the brain handles vision?", choices: ["Frontal lobe", "Parietal lobe", "Occipital lobe", "Temporal lobe"], correct: 2 },
  { question: "Which fluid is filtered by the kidneys?", choices: ["Bile", "Blood", "Lymph", "Cerebrospinal fluid"], correct: 1 },
  { question: "What is the largest joint in the body?", choices: ["Shoulder", "Hip", "Knee", "Elbow"], correct: 2 },
  { question: "Which organ stores bile?", choices: ["Pancreas", "Gallbladder", "Spleen", "Stomach"], correct: 1 },
  { question: "How many cervical vertebrae do humans have?", choices: ["5", "7", "12", "24"], correct: 1 },
  { question: "What is the body's largest muscle?", choices: ["Biceps", "Quadriceps", "Gluteus maximus", "Pectoralis"], correct: 2 },
  { question: "Which type of cell fights infection?", choices: ["Red blood cells", "White blood cells", "Platelets", "Plasma"], correct: 1 },
  { question: "What is the windpipe also called?", choices: ["Trachea", "Esophagus", "Bronchus", "Larynx"], correct: 0 },
  { question: "Which sense do the rods and cones serve?", choices: ["Hearing", "Sight", "Smell", "Taste"], correct: 1 },
  { question: "What does the diaphragm help control?", choices: ["Vision", "Breathing", "Digestion", "Hearing"], correct: 1 },
  { question: "What is the medical term for the kneecap?", choices: ["Patella", "Fibula", "Tibia", "Tarsal"], correct: 0 },
  { question: "How long is the small intestine (approx)?", choices: ["1 m", "3 m", "6 m", "10 m"], correct: 2 },
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
