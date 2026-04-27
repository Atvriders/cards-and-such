import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PaintingTechniquesQuizSettings { questions: "10" | "20"; }
export interface PaintingTechniquesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PaintingTechniquesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Oil paint dries by?",
    "choices": [
      "evaporation",
      "oxidation",
      "fermentation",
      "sublimation"
    ],
    "correct": 1
  },
  {
    "question": "Watercolor uses what binder?",
    "choices": [
      "oil",
      "gum arabic",
      "acrylic",
      "wax"
    ],
    "correct": 1
  },
  {
    "question": "Impasto refers to?",
    "choices": [
      "thin washes",
      "thick paint application",
      "glazing",
      "stippling"
    ],
    "correct": 1
  },
  {
    "question": "A canvas should typically be?",
    "choices": [
      "unprimed",
      "primed with gesso",
      "wet",
      "stretched without prep"
    ],
    "correct": 1
  },
  {
    "question": "Glazing means?",
    "choices": [
      "thick layer",
      "translucent thin layer",
      "sanding",
      "scraping"
    ],
    "correct": 1
  },
  {
    "question": "Acrylic paint dries by?",
    "choices": [
      "oxidation",
      "evaporation of water",
      "heat",
      "UV light"
    ],
    "correct": 1
  },
  {
    "question": "Gesso is used to?",
    "choices": [
      "thin paint",
      "prime surfaces",
      "clean brushes",
      "fix paint"
    ],
    "correct": 1
  },
  {
    "question": "Chiaroscuro emphasizes?",
    "choices": [
      "color",
      "light/dark contrast",
      "texture",
      "scale"
    ],
    "correct": 1
  },
  {
    "question": "Sfumato is a soft?",
    "choices": [
      "color",
      "blending technique",
      "linework",
      "perspective method"
    ],
    "correct": 1
  },
  {
    "question": "Plein air means painting?",
    "choices": [
      "indoors",
      "outdoors",
      "quickly",
      "slowly"
    ],
    "correct": 1
  },
  {
    "question": "Underpainting establishes?",
    "choices": [
      "composition basics",
      "final colors",
      "frames",
      "texture"
    ],
    "correct": 0
  },
  {
    "question": "Stippling uses?",
    "choices": [
      "dots",
      "lines",
      "washes",
      "scratches"
    ],
    "correct": 0
  },
  {
    "question": "Wet-on-wet is associated with?",
    "choices": [
      "Bob Ross",
      "Picasso",
      "Dali",
      "Warhol"
    ],
    "correct": 0
  },
  {
    "question": "A pochade box is for?",
    "choices": [
      "studio work",
      "plein air painting",
      "framing",
      "grinding pigments"
    ],
    "correct": 1
  },
  {
    "question": "Pointillism uses?",
    "choices": [
      "lines",
      "tiny dots",
      "squares",
      "triangles"
    ],
    "correct": 1
  },
  {
    "question": "Fat over lean refers to?",
    "choices": [
      "watercolor",
      "oil layering rule",
      "framing",
      "stretching"
    ],
    "correct": 1
  },
  {
    "question": "A palette knife is used for?",
    "choices": [
      "cutting canvas",
      "mixing or applying paint",
      "cleaning brushes",
      "stretching"
    ],
    "correct": 1
  },
  {
    "question": "Tempera was popular in?",
    "choices": [
      "modern era",
      "medieval/Renaissance",
      "19th century only",
      "ancient Egypt only"
    ],
    "correct": 1
  },
  {
    "question": "Gouache is opaque?",
    "choices": [
      "oil paint",
      "watercolor",
      "ink",
      "acrylic only"
    ],
    "correct": 1
  },
  {
    "question": "Linseed oil thins which paint?",
    "choices": [
      "acrylic",
      "oil",
      "watercolor",
      "tempera"
    ],
    "correct": 1
  }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: PaintingTechniquesQuizSettings): PaintingTechniquesQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: PaintingTechniquesQuizState, action: PaintingTechniquesQuizAction): PaintingTechniquesQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: PaintingTechniquesQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
