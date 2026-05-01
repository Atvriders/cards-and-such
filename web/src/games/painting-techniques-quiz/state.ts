import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface PaintingTechniquesQuizSettings { questions: "10" | "20"; }
export interface PaintingTechniquesQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type PaintingTechniquesQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "Oil paint uses which binder?",
    "choices": [
      "water",
      "linseed/walnut oil",
      "egg yolk",
      "gum arabic"
    ],
    "correct": 1
  },
  {
    "question": "Watercolor uses which binder?",
    "choices": [
      "oil",
      "gum arabic",
      "egg",
      "wax"
    ],
    "correct": 1
  },
  {
    "question": "Tempera paint traditionally uses?",
    "choices": [
      "linseed oil",
      "egg yolk",
      "gum arabic",
      "acrylic resin"
    ],
    "correct": 1
  },
  {
    "question": "'Impasto' refers to?",
    "choices": [
      "thin washes",
      "thick paint texture",
      "glazing",
      "sgraffito"
    ],
    "correct": 1
  },
  {
    "question": "Glazing is layering?",
    "choices": [
      "thick paint",
      "thin transparent layers",
      "gesso",
      "ink"
    ],
    "correct": 1
  },
  {
    "question": "'Chiaroscuro' is the contrast of?",
    "choices": [
      "colors",
      "light and dark",
      "warm/cool",
      "textures"
    ],
    "correct": 1
  },
  {
    "question": "Sfumato is a soft technique pioneered by?",
    "choices": [
      "Raphael",
      "Da Vinci",
      "Caravaggio",
      "Vermeer"
    ],
    "correct": 1
  },
  {
    "question": "Acrylics dry primarily by?",
    "choices": [
      "oxidation",
      "water evaporation",
      "heat",
      "UV"
    ],
    "correct": 1
  },
  {
    "question": "Underpainting in 'grisaille' is in tones of?",
    "choices": [
      "red",
      "gray",
      "blue",
      "yellow"
    ],
    "correct": 1
  },
  {
    "question": "'Alla prima' means?",
    "choices": [
      "layered",
      "wet-on-wet in one session",
      "glazed",
      "dry brush"
    ],
    "correct": 1
  },
  {
    "question": "Canvas is typically primed with?",
    "choices": [
      "varnish",
      "gesso",
      "linseed oil",
      "water"
    ],
    "correct": 1
  },
  {
    "question": "Oil paintings are best painted 'fat over?",
    "choices": [
      "thin",
      "thick",
      "wet",
      "dry"
    ],
    "correct": 0
  },
  {
    "question": "A 'palette knife' is used for?",
    "choices": [
      "stretching",
      "mixing/applying paint",
      "priming",
      "cleaning"
    ],
    "correct": 1
  },
  {
    "question": "Pointillism uses?",
    "choices": [
      "broad strokes",
      "tiny dots of color",
      "glaze",
      "drip"
    ],
    "correct": 1
  },
  {
    "question": "Seurat is associated with?",
    "choices": [
      "Cubism",
      "Pointillism",
      "Surrealism",
      "Realism"
    ],
    "correct": 1
  },
  {
    "question": "Fresco is painted on?",
    "choices": [
      "dry plaster",
      "wet plaster",
      "canvas",
      "wood"
    ],
    "correct": 1
  },
  {
    "question": "Gouache is similar to watercolor but?",
    "choices": [
      "transparent",
      "opaque",
      "oil-based",
      "plastic"
    ],
    "correct": 1
  },
  {
    "question": "'Wet-on-wet' watercolor produces?",
    "choices": [
      "sharp lines",
      "soft blends",
      "crisp edges",
      "textures"
    ],
    "correct": 1
  },
  {
    "question": "Encaustic painting uses heated?",
    "choices": [
      "resin",
      "wax",
      "oil",
      "gesso"
    ],
    "correct": 1
  },
  {
    "question": "Stippling uses?",
    "choices": [
      "broad sweeps",
      "small dots/marks",
      "blending",
      "glazes"
    ],
    "correct": 1
  },
  {
    "question": "'Scumbling' applies?",
    "choices": [
      "thick paint",
      "broken thin layer",
      "glaze",
      "wash"
    ],
    "correct": 1
  },
  {
    "question": "Color theory's primary colors (traditional) are?",
    "choices": [
      "red, green, blue",
      "red, yellow, blue",
      "cyan, magenta, yellow",
      "orange, purple, green"
    ],
    "correct": 1
  },
  {
    "question": "Complementary colors sit?",
    "choices": [
      "next to each other",
      "opposite on color wheel",
      "adjacent",
      "same"
    ],
    "correct": 1
  },
  {
    "question": "'Tooth' refers to?",
    "choices": [
      "paint texture",
      "paper/canvas surface roughness",
      "brush",
      "gesso"
    ],
    "correct": 1
  },
  {
    "question": "A 'mahlstick' is used to?",
    "choices": [
      "mix paint",
      "steady the hand",
      "prime canvas",
      "clean brushes"
    ],
    "correct": 1
  },
  {
    "question": "Caravaggio is known for dramatic?",
    "choices": [
      "pointillism",
      "tenebrism",
      "cubism",
      "abstraction"
    ],
    "correct": 1
  },
  {
    "question": "The 'Mona Lisa' is painted on?",
    "choices": [
      "canvas",
      "poplar wood panel",
      "paper",
      "metal"
    ],
    "correct": 1
  },
  {
    "question": "Linseed oil yellows over time more than?",
    "choices": [
      "walnut",
      "poppy",
      "both",
      "none"
    ],
    "correct": 2
  },
  {
    "question": "'Drying time' for oil paint can be days to?",
    "choices": [
      "minutes",
      "hours",
      "weeks/months",
      "years only"
    ],
    "correct": 2
  },
  {
    "question": "Bob Ross is famous for popularizing?",
    "choices": [
      "fresco",
      "wet-on-wet oil painting",
      "watercolor",
      "fresco"
    ],
    "correct": 1
  },
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
