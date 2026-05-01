import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PhotographyQuizSettings { questions: "10" | "20"; }
export interface PhotographyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PhotographyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Aperture controls?",
    "choices": [
      "shutter speed",
      "amount of light/depth of field",
      "focus",
      "ISO"
    ],
    "correct": 1
  },
  {
    "question": "A lower f-number means?",
    "choices": [
      "smaller aperture",
      "larger aperture",
      "slower shutter",
      "more grain"
    ],
    "correct": 1
  },
  {
    "question": "ISO measures?",
    "choices": [
      "lens length",
      "sensor sensitivity",
      "aperture",
      "shutter"
    ],
    "correct": 1
  },
  {
    "question": "The 'rule of thirds' helps with?",
    "choices": [
      "exposure",
      "composition",
      "focusing",
      "white balance"
    ],
    "correct": 1
  },
  {
    "question": "Shutter speed of 1/1000s is best for?",
    "choices": [
      "star trails",
      "freezing motion",
      "long exposure",
      "panning"
    ],
    "correct": 1
  },
  {
    "question": "'Bokeh' refers to?",
    "choices": [
      "sharpness",
      "aesthetic blur",
      "color cast",
      "flare"
    ],
    "correct": 1
  },
  {
    "question": "HDR stands for?",
    "choices": [
      "High Definition Resolution",
      "High Dynamic Range",
      "Hyper Drive",
      "High Density"
    ],
    "correct": 1
  },
  {
    "question": "A 50mm lens on full frame is considered?",
    "choices": [
      "wide",
      "standard",
      "telephoto",
      "macro"
    ],
    "correct": 1
  },
  {
    "question": "Golden hour occurs?",
    "choices": [
      "midday",
      "just after sunrise/before sunset",
      "midnight",
      "at noon"
    ],
    "correct": 1
  },
  {
    "question": "Long exposure photography requires?",
    "choices": [
      "high ISO",
      "tripod and slow shutter",
      "fast aperture",
      "flash"
    ],
    "correct": 1
  },
  {
    "question": "Raw files retain?",
    "choices": [
      "compressed JPEG data",
      "more sensor data",
      "less data",
      "no metadata"
    ],
    "correct": 1
  },
  {
    "question": "White balance corrects?",
    "choices": [
      "focus",
      "color casts",
      "sharpness",
      "exposure"
    ],
    "correct": 1
  },
  {
    "question": "A 'prime lens' has?",
    "choices": [
      "zoom",
      "fixed focal length",
      "tilt",
      "macro"
    ],
    "correct": 1
  },
  {
    "question": "Depth of field is shallower with?",
    "choices": [
      "small aperture",
      "large aperture",
      "small ISO",
      "fast shutter"
    ],
    "correct": 1
  },
  {
    "question": "The exposure triangle is aperture, shutter, and?",
    "choices": [
      "focus",
      "ISO",
      "white balance",
      "focal length"
    ],
    "correct": 1
  },
  {
    "question": "Macro photography emphasizes?",
    "choices": [
      "wide landscapes",
      "close-up small subjects",
      "distant subjects",
      "panoramas"
    ],
    "correct": 1
  },
  {
    "question": "A polarizer reduces?",
    "choices": [
      "light",
      "reflections and glare",
      "noise",
      "sharpness"
    ],
    "correct": 1
  },
  {
    "question": "Ansel Adams was known for?",
    "choices": [
      "fashion",
      "landscape",
      "sports",
      "journalism"
    ],
    "correct": 1
  },
  {
    "question": "The Zone System was developed by?",
    "choices": [
      "Adams and Archer",
      "Cartier-Bresson",
      "Eggleston",
      "Avedon"
    ],
    "correct": 0
  },
  {
    "question": "'Decisive moment' is associated with?",
    "choices": [
      "Adams",
      "Cartier-Bresson",
      "Steichen",
      "Maier"
    ],
    "correct": 1
  },
  {
    "question": "A 'crop sensor' is smaller than?",
    "choices": [
      "medium format",
      "full frame",
      "both",
      "neither"
    ],
    "correct": 1
  },
  {
    "question": "Diffraction softens images at?",
    "choices": [
      "wide apertures",
      "very small apertures",
      "high ISO",
      "fast shutter"
    ],
    "correct": 1
  },
  {
    "question": "Histogram shows?",
    "choices": [
      "focus",
      "tonal distribution",
      "colors only",
      "sharpness"
    ],
    "correct": 1
  },
  {
    "question": "Reciprocity means?",
    "choices": [
      "focus law",
      "equivalent exposures",
      "color law",
      "ISO law"
    ],
    "correct": 1
  },
  {
    "question": "Hyperfocal distance maximizes?",
    "choices": [
      "bokeh",
      "depth of field",
      "exposure",
      "color"
    ],
    "correct": 1
  },
  {
    "question": "A graduated ND filter darkens?",
    "choices": [
      "whole frame",
      "one half/sky",
      "corners",
      "shadows"
    ],
    "correct": 1
  },
  {
    "question": "Chromatic aberration is?",
    "choices": [
      "motion blur",
      "color fringing",
      "dust",
      "banding"
    ],
    "correct": 1
  },
  {
    "question": "Mirrorless cameras lack a?",
    "choices": [
      "sensor",
      "reflex mirror",
      "viewfinder",
      "battery"
    ],
    "correct": 1
  },
  {
    "question": "'Stopping down' means using a?",
    "choices": [
      "wider aperture",
      "smaller aperture",
      "faster shutter",
      "higher ISO"
    ],
    "correct": 1
  },
  {
    "question": "Daguerreotype was an early form of?",
    "choices": [
      "video",
      "photography",
      "printing",
      "engraving"
    ],
    "correct": 1
  },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PhotographyQuizSettings): PhotographyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PhotographyQuizState, action: PhotographyQuizAction): PhotographyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PhotographyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
