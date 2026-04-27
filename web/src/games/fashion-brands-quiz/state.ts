import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FashionBrandsQuizSettings { questions: "10" | "20" | "30"; }
export interface FashionBrandsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FashionBrandsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Chanel was founded by?", choices: ["Coco Chanel", "Yves Saint Laurent", "Karl Lagerfeld", "Christian Dior"], correct: 0 },
  { question: "Gucci is from which country?", choices: ["France", "Italy", "Spain", "UK"], correct: 1 },
  { question: "Prada's home city?", choices: ["Florence", "Rome", "Milan", "Naples"], correct: 2 },
  { question: "Louis Vuitton specializes in?", choices: ["Watches", "Trunks/leather", "Footwear", "Cosmetics"], correct: 1 },
  { question: "Hermès originated as?", choices: ["Saddlemaker", "Tailor", "Hatmaker", "Shoemaker"], correct: 0 },
  { question: "Versace founder Gianni was from?", choices: ["France", "Italy", "Spain", "Greece"], correct: 1 },
  { question: "Christian Dior unveiled the \"New Look\" in?", choices: ["1937", "1947", "1957", "1967"], correct: 1 },
  { question: "Yves Saint Laurent introduced what for women?", choices: ["Mini skirt", "Le Smoking tuxedo", "Wedge heel", "Trench coat"], correct: 1 },
  { question: "Burberry is a famous?", choices: ["Italian house", "British heritage label", "French fashion line", "American sportswear"], correct: 1 },
  { question: "Tom Ford revitalized which brand in the 1990s?", choices: ["Prada", "Gucci", "Chanel", "Dior"], correct: 1 },
  { question: "Calvin Klein is from?", choices: ["UK", "France", "USA", "Italy"], correct: 2 },
  { question: "Ralph Lauren is famous for the?", choices: ["Polo logo", "Crocodile logo", "Lion crest", "Star monogram"], correct: 0 },
  { question: "Tommy Hilfiger originated in?", choices: ["UK", "USA", "Italy", "Germany"], correct: 1 },
  { question: "Lacoste's logo is a?", choices: ["Polo player", "Crocodile", "Eagle", "Horse"], correct: 1 },
  { question: "Karl Lagerfeld led which house for decades?", choices: ["Dior", "Chanel", "Versace", "Saint Laurent"], correct: 1 },
  { question: "Balenciaga is originally Spanish or French?", choices: ["Spanish", "French", "Italian", "British"], correct: 0 },
  { question: "Givenchy famously dressed?", choices: ["Audrey Hepburn", "Marilyn Monroe", "Madonna", "Princess Diana"], correct: 0 },
  { question: "Fendi is famous for?", choices: ["Watches", "Furs and leather", "Sneakers", "Sunglasses only"], correct: 1 },
  { question: "Bottega Veneta is known for?", choices: ["Intrecciato weave", "Logo prints", "Sequin gowns", "Leather jackets"], correct: 0 },
  { question: "Issey Miyake is from?", choices: ["Korea", "Japan", "China", "Vietnam"], correct: 1 },
  { question: "Comme des Garçons designer?", choices: ["Rei Kawakubo", "Junya Watanabe", "Yohji Yamamoto", "Hiroshi Fujiwara"], correct: 0 },
  { question: "Vivienne Westwood is famous for?", choices: ["Punk fashion", "Couture gowns", "Athleisure", "Suits"], correct: 0 },
  { question: "Stella McCartney is known for?", choices: ["Vegan luxury", "Plus-size lines", "Streetwear", "Bridal"], correct: 0 },
  { question: "Off-White was founded by?", choices: ["Kanye West", "Virgil Abloh", "Pharrell Williams", "Jerry Lorenzo"], correct: 1 },
  { question: "Supreme started in?", choices: ["London", "NYC", "Tokyo", "Paris"], correct: 1 },
  { question: "Alexander McQueen was British?", choices: ["Yes", "No, Italian", "No, French", "No, American"], correct: 0 },
  { question: "Marc Jacobs led which house?", choices: ["Chanel", "Louis Vuitton", "Dior", "Gucci"], correct: 1 },
  { question: "Carolina Herrera is from?", choices: ["Brazil", "Venezuela", "Argentina", "Mexico"], correct: 1 },
  { question: "Jean Paul Gaultier dressed Madonna in the famous?", choices: ["Cone bra", "Wedding gown", "Leather jumpsuit", "Top hat"], correct: 0 },
  { question: "Miu Miu is a sister brand of?", choices: ["Gucci", "Prada", "Versace", "Fendi"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FashionBrandsQuizSettings): FashionBrandsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FashionBrandsQuizState, action: FashionBrandsQuizAction): FashionBrandsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FashionBrandsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
