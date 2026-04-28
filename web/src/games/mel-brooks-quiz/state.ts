import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MelBrooksQuizSettings { questions: "10" | "20" | "30"; }
export interface MelBrooksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MelBrooksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which film parodies Star Wars?", choices: ["Spaceballs", "Robin Hood: Men in Tights", "Dracula: Dead and Loving It", "High Anxiety"], correct: 0 },
  { question: "Year Blazing Saddles released?", choices: ["1971", "1974", "1977", "1980"], correct: 1 },
  { question: "Year Young Frankenstein released?", choices: ["1972", "1974", "1976", "1978"], correct: 1 },
  { question: "Director of Young Frankenstein?", choices: ["Mel Brooks", "Gene Wilder", "Carl Reiner", "Woody Allen"], correct: 0 },
  { question: "Spaceballs main villain?", choices: ["Lone Star", "Dark Helmet", "Yogurt", "Skroob"], correct: 1 },
  { question: "Who played Dark Helmet?", choices: ["Bill Pullman", "Rick Moranis", "Mel Brooks", "John Candy"], correct: 1 },
  { question: "Mel Brooks plays which two roles in Spaceballs?", choices: ["Yogurt and Skroob", "Lone Star", "Dark Helmet", "Pizza the Hutt"], correct: 0 },
  { question: "Spaceballs year?", choices: ["1985", "1987", "1989", "1991"], correct: 1 },
  { question: "Sheriff Bart in Blazing Saddles played by?", choices: ["Cleavon Little", "Richard Pryor", "Gene Wilder", "Harvey Korman"], correct: 0 },
  { question: "Who co-wrote Blazing Saddles with Brooks?", choices: ["Gene Wilder", "Richard Pryor", "Carl Reiner", "Larry Gelbart"], correct: 1 },
  { question: "The Producers (1968) original starred?", choices: ["Wilder & Mostel", "Pryor & Wilder", "Brooks & Reiner", "Caine & Allen"], correct: 0 },
  { question: "What musical is staged in The Producers?", choices: ["Springtime for Hitler", "Heil, Heil", "The Reich", "Adolf!"], correct: 0 },
  { question: "High Anxiety (1977) parodies which director?", choices: ["Hitchcock", "Spielberg", "Kubrick", "Coppola"], correct: 0 },
  { question: "Which Brooks film parodies Robin Hood?", choices: ["Robin Hood: Men in Tights", "Robin Hood", "The Twelve Chairs", "Silent Movie"], correct: 0 },
  { question: "Robin Hood: Men in Tights year?", choices: ["1989", "1991", "1993", "1995"], correct: 2 },
  { question: "Cary Elwes played Robin in Men in Tights — what other role made him famous?", choices: ["Westley (Princess Bride)", "Saw", "Twister", "All of these"], correct: 3 },
  { question: "Brooks created which TV spy comedy?", choices: ["Get Smart", "I Spy", "Spy vs Spy", "The Avengers"], correct: 0 },
  { question: "Which Brooks film is silent?", choices: ["Silent Movie", "High Anxiety", "History of the World, Part I", "Life Stinks"], correct: 0 },
  { question: "Only word spoken in Silent Movie said by?", choices: ["Marcel Marceau", "Brooks", "Reiner", "DeLuise"], correct: 0 },
  { question: "History of the World, Part I year?", choices: ["1979", "1981", "1983", "1985"], correct: 1 },
  { question: "Brooks won an EGOT?", choices: ["Yes", "No", "Almost", "Just Tony"], correct: 0 },
  { question: "Brooks was born in?", choices: ["1922", "1926", "1930", "1934"], correct: 1 },
  { question: "Frau Blücher is in?", choices: ["Young Frankenstein", "Spaceballs", "Blazing Saddles", "Dracula"], correct: 0 },
  { question: "Who played Frau Blücher?", choices: ["Madeline Kahn", "Cloris Leachman", "Teri Garr", "Estelle Reiner"], correct: 1 },
  { question: "Madeline Kahn was Lili Von Shtupp in?", choices: ["Blazing Saddles", "Young Frankenstein", "High Anxiety", "History of the World"], correct: 0 },
  { question: "'Walk this way' joke comes from?", choices: ["Young Frankenstein", "Blazing Saddles", "Spaceballs", "Producers"], correct: 0 },
  { question: "Brooks's first feature?", choices: ["The Producers", "The Twelve Chairs", "Blazing Saddles", "Silent Movie"], correct: 0 },
  { question: "Brooks won Oscar for?", choices: ["Best Director", "Best Picture", "Best Original Screenplay (Producers)", "Best Song"], correct: 2 },
  { question: "Who directed Spaceballs?", choices: ["Mel Brooks", "George Lucas", "Carl Reiner", "Robert Zemeckis"], correct: 0 },
  { question: "Brooks and Anne Bancroft were married for how long?", choices: ["20 years", "30 years", "40+ years", "Never married"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MelBrooksQuizSettings): MelBrooksQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MelBrooksQuizState, action: MelBrooksQuizAction): MelBrooksQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MelBrooksQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
