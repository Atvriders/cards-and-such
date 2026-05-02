import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; explanation?: string; }
export interface ChemistryLabQuizSettings { questions: "10" | "20" | "30"; }
export interface ChemistryLabQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ChemistryLabQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What's a Bunsen burner used for?", choices: ["Heating chemicals","Stirring","Measuring volume","Filtering"], correct: 0, explanation: "Invented by Robert Bunsen in 1855, it produces a hot, sootless flame for heating chemicals." },
  { question: "What's a beaker?", choices: ["Cylindrical glass container with spout","Tall narrow flask","Round flask","Test tube"], correct: 0, explanation: "Cylindrical with a flat bottom and pour spout — useful for stirring, mixing, and rough volume work." },
  { question: "What's an Erlenmeyer flask shape?", choices: ["Conical","Round","Cylindrical","Square"], correct: 0, explanation: "Conical with a flat bottom and narrow neck — great for swirling without splashing during titrations." },
  { question: "What's a graduated cylinder used for?", choices: ["Measuring liquid volume","Heating","Mixing","Filtering"], correct: 0, explanation: "Tall and narrow, marked in mL — far more accurate for measuring liquid volumes than a beaker." },
  { question: "What's a pipette?", choices: ["Precise volume liquid transfer","Heating","Stirring","Measuring mass"], correct: 0, explanation: "A pipette delivers precise small volumes; types include volumetric, graduated, and micropipettes." },
  { question: "What's a burette?", choices: ["Titration tool","Heating","Mixing","Storage"], correct: 0, explanation: "A long graduated tube with a stopcock used to deliver controlled, variable volumes during titrations." },
  { question: "What's a desiccator?", choices: ["Removes moisture","Heats","Cools","Filters"], correct: 0, explanation: "A sealed container with a drying agent (like silica gel) that keeps samples moisture-free." },
  { question: "What's litmus paper test?", choices: ["pH indicator","Temperature","Density","Mass"], correct: 0, explanation: "Litmus paper detects acidity/alkalinity by changing colour — a classic qualitative pH indicator." },
  { question: "What color does litmus turn in acid?", choices: ["Red","Blue","Green","Yellow"], correct: 0, explanation: "Blue litmus paper turns red in acidic solutions (pH < 7)." },
  { question: "What color does litmus turn in base?", choices: ["Blue","Red","Green","Yellow"], correct: 0, explanation: "Red litmus paper turns blue in basic (alkaline) solutions (pH > 7)." },
  { question: "What's a centrifuge for?", choices: ["Separating mixtures by density","Heating","Filtering","Mixing"], correct: 0, explanation: "Spinning samples at high speed uses centrifugal force to separate components by density." },
  { question: "What's a fume hood?", choices: ["Ventilated cabinet for hazardous chemicals","Heating area","Storage","Mixing area"], correct: 0, explanation: "A ventilated enclosure that draws air away from the user, protecting from toxic vapours." },
  { question: "What's PPE in lab?", choices: ["Personal Protective Equipment","Pipette","Beaker tools","All gear"], correct: 0, explanation: "Personal Protective Equipment — goggles, gloves, lab coat, closed-toe shoes — is required at all times." },
  { question: "What's required eye PPE?", choices: ["Safety goggles","Glasses","Both","Mask"], correct: 2, explanation: "Splash-rated safety goggles seal around the eyes; regular glasses don't provide enough protection." },
  { question: "What's an MSDS?", choices: ["Material Safety Data Sheet (now SDS)","Lab manual","Equipment guide","Reagent list"], correct: 0, explanation: "Material Safety Data Sheet (now called Safety Data Sheet/SDS) lists hazards and handling for each chemical." },
  { question: "What's a meniscus?", choices: ["Curve of liquid in cylinder","Bubble","Just water","Foam"], correct: 0, explanation: "The curved surface of a liquid in a narrow tube, caused by surface tension and adhesion." },
  { question: "How do you read a meniscus?", choices: ["At eye level, bottom of curve for water","Top","From above","From below"], correct: 0, explanation: "Read at eye level, at the bottom of the curve for water (concave); at the top for mercury (convex)." },
  { question: "What's distilled water?", choices: ["Pure water with no minerals","Tap","Both","Bottled"], correct: 0, explanation: "Water purified via boiling and condensing to remove dissolved minerals and contaminants." },
  { question: "What's titration?", choices: ["Adding measured volume to find concentration","Heating","Filtering","Mixing"], correct: 0, explanation: "A quantitative analytical method where a reagent of known concentration determines an unknown's concentration." },
  { question: "What's a chemical indicator?", choices: ["Substance changing color with chemical change","Test paper","Both","Just paper"], correct: 2, explanation: "A substance — often a coloured dye like phenolphthalein — that visibly signals a pH or reaction change." },
  { question: "What's filtration?", choices: ["Separating solid from liquid","Heating","Mixing","Distilling"], correct: 0, explanation: "A separation technique using porous material (filter paper) to retain solids while letting liquid pass." },
  { question: "What's distillation?", choices: ["Boiling and condensing to separate","Filtering","Mixing","Centrifuging"], correct: 0, explanation: "Separating liquids by boiling and condensing — exploits differences in boiling points." },
  { question: "What's chromatography?", choices: ["Separating mixtures by movement through medium","Filtering","Boiling","Just separation"], correct: 0, explanation: "A family of techniques that separates mixtures by differential movement through a stationary phase." },
  { question: "What's a hot plate used for?", choices: ["Heating without flame","Stirring only","Cooling","Storage"], correct: 0, explanation: "An electric heating surface that's safer than open flames for heating beakers and flasks." },
  { question: "What's a magnetic stirrer?", choices: ["Mixes liquid using magnet","Heats","Cools","Filters"], correct: 0, explanation: "A spinning magnet under the vessel rotates a stir bar inside, mixing solutions hands-free." },
  { question: "What's a stoichiometric ratio?", choices: ["Mole ratio between reactants/products","Just ratio","Both","Just chemistry"], correct: 2, explanation: "The exact mole ratio in which reactants combine, derived from a balanced chemical equation." },
  { question: "What's the universal solvent?", choices: ["Water","Ethanol","Acetone","Hexane"], correct: 0, explanation: "Water dissolves more substances than any other common liquid — earning the 'universal solvent' nickname." },
  { question: "What's a precipitate?", choices: ["Insoluble solid forming in liquid","Solution","Both","Just liquid"], correct: 0, explanation: "An insoluble solid that forms and falls out of solution during a chemical reaction." },
  { question: "What's an exothermic reaction?", choices: ["Releases heat","Absorbs heat","Just hot","Just cool"], correct: 0, explanation: "A reaction that releases energy, typically as heat — combustion is a classic example." },
  { question: "What's an endothermic reaction?", choices: ["Absorbs heat","Releases heat","Both","Just hot"], correct: 0, explanation: "A reaction that absorbs heat from its surroundings — instant cold packs use this principle." },
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
