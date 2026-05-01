import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MelBrooksQuizSettings { questions: "10" | "20" | "30"; }
export interface MelBrooksQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MelBrooksQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What is Mel Brooks' birth name?", choices: ["Melvin Kaminsky", "Melvin Brookstein", "Mel Brookman", "Melvin Brooks"], correct: 0 },
  { question: "Which year was Mel Brooks born?", choices: ["1920", "1926", "1932", "1936"], correct: 1 },
  { question: "Brooks won an Oscar for screenplay of which 1968 film?", choices: ["The Producers", "Blazing Saddles", "Young Frankenstein", "High Anxiety"], correct: 0 },
  { question: "Who directed and wrote 'Blazing Saddles' (1974)?", choices: ["Mel Brooks", "Carl Reiner", "Woody Allen", "Gene Wilder"], correct: 0 },
  { question: "Who starred as Dr. Frankenstein in 'Young Frankenstein'?", choices: ["Gene Wilder", "Marty Feldman", "Mel Brooks", "Peter Boyle"], correct: 0 },
  { question: "What 1987 film parodies Star Wars?", choices: ["Spaceballs", "Galaxy Quest", "Star Crash", "Space Wars"], correct: 0 },
  { question: "Who plays Lord Dark Helmet in 'Spaceballs'?", choices: ["Rick Moranis", "Mel Brooks", "John Candy", "Bill Pullman"], correct: 0 },
  { question: "What film parodies Hitchcock thrillers?", choices: ["High Anxiety", "Silent Movie", "The Producers", "History of the World"], correct: 0 },
  { question: "Who composed scores for many Brooks films?", choices: ["John Morris", "John Williams", "Henry Mancini", "Maurice Jarre"], correct: 0 },
  { question: "Brooks' 'The Producers' was remade as a stage musical that won how many Tony Awards in 2001?", choices: ["7", "9", "12", "15"], correct: 2 },
  { question: "What song does Springtime for Hitler belong to?", choices: ["The Producers", "Blazing Saddles", "History of the World", "Young Frankenstein"], correct: 0 },
  { question: "Marty Feldman plays which character in 'Young Frankenstein'?", choices: ["Igor", "The Monster", "Frankenstein", "Inspector Kemp"], correct: 0 },
  { question: "Who was Mel Brooks' wife and frequent collaborator (until 2005)?", choices: ["Anne Bancroft", "Madeline Kahn", "Carol Kane", "Cloris Leachman"], correct: 0 },
  { question: "What film co-stars Cleavon Little as a black sheriff?", choices: ["Blazing Saddles", "The Producers", "Silent Movie", "Robin Hood: Men in Tights"], correct: 0 },
  { question: "Who plays Robin Hood in Brooks' 1993 parody?", choices: ["Cary Elwes", "Dave Chappelle", "Richard Lewis", "Mel Brooks"], correct: 0 },
  { question: "What 1976 silent comedy did Brooks direct?", choices: ["Silent Movie", "High Anxiety", "Blazing Saddles", "The Twelve Chairs"], correct: 0 },
  { question: "Brooks parodied vampire movies in which 1995 film?", choices: ["Dracula: Dead and Loving It", "Twilight Zone", "Vampire Bites", "Bela's Curse"], correct: 0 },
  { question: "Brooks is one of how many EGOT winners (Emmy, Grammy, Oscar, Tony)?", choices: ["A small group", "Hundreds", "Thousands", "Just three"], correct: 0 },
  { question: "What sitcom did Brooks co-create with Buck Henry in 1965?", choices: ["Get Smart", "I Spy", "F Troop", "Hogan's Heroes"], correct: 0 },
  { question: "Brooks played the 2000-Year-Old Man with which partner?", choices: ["Carl Reiner", "Sid Caesar", "Woody Allen", "Larry Gelbart"], correct: 0 },
  { question: "Brooks wrote for which classic 1950s sketch show?", choices: ["Your Show of Shows", "The Honeymooners", "I Love Lucy", "Texaco Star Theater"], correct: 0 },
  { question: "Who is the Monster in 'Young Frankenstein'?", choices: ["Peter Boyle", "Gene Hackman", "Marty Feldman", "Cloris Leachman"], correct: 0 },
  { question: "Brooks plays Yogurt in which film?", choices: ["Spaceballs", "Robin Hood: Men in Tights", "History of the World", "High Anxiety"], correct: 0 },
  { question: "Which Brooks film features the line 'Walk this way'?", choices: ["Young Frankenstein", "Blazing Saddles", "Spaceballs", "The Producers"], correct: 0 },
  { question: "Who plays Bart in 'Blazing Saddles'?", choices: ["Cleavon Little", "Richard Pryor", "Gene Wilder", "Harvey Korman"], correct: 0 },
  { question: "Brooks' 'History of the World, Part I' covered which eras?", choices: ["Stone Age to French Revolution", "Renaissance to WWII", "Just ancient Rome", "Medieval period"], correct: 0 },
  { question: "What vehicle is parodied in 'Spaceballs' as 'Mega Maid'?", choices: ["A vacuum-shaped warship", "A Star Destroyer", "Death Star", "A space station shaped like a maid"], correct: 3 },
  { question: "Which Pryor co-wrote 'Blazing Saddles'?", choices: ["Richard Pryor", "Eddie Murphy", "Cleavon Little", "Bill Cosby"], correct: 0 },
  { question: "What was Brooks' first feature directed?", choices: ["The Producers", "The Twelve Chairs", "Blazing Saddles", "Silent Movie"], correct: 0 },
  { question: "What 2000 sequel did Brooks make to History of the World?", choices: ["No theatrical sequel; Part II is a 2023 series", "History Returns", "World Lives", "Part II 1995 film"], correct: 0 },
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
