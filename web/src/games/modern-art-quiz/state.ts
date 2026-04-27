import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ModernArtQuizSettings { questions: "10" | "20" | "30"; }
export interface ModernArtQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ModernArtQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which artist is famous for Campbell's Soup Cans?", choices: ["Roy Lichtenstein", "Andy Warhol", "Jasper Johns", "Robert Rauschenberg"], correct: 1 },
  { question: "The painting 'Les Demoiselles d'Avignon' was created by?", choices: ["Matisse", "Braque", "Picasso", "Léger"], correct: 2 },
  { question: "Which movement did Salvador Dalí belong to?", choices: ["Cubism", "Fauvism", "Surrealism", "Dadaism"], correct: 2 },
  { question: "Jackson Pollock is best known for which technique?", choices: ["Pointillism", "Drip painting", "Watercolor", "Fresco"], correct: 1 },
  { question: "Which artist created the 'Marilyn Diptych'?", choices: ["Andy Warhol", "Jasper Johns", "Jean-Michel Basquiat", "Keith Haring"], correct: 0 },
  { question: "Mark Rothko is associated with which movement?", choices: ["Pop Art", "Abstract Expressionism", "Minimalism", "Conceptualism"], correct: 1 },
  { question: "Who painted 'The Persistence of Memory' with melting clocks?", choices: ["Magritte", "Miró", "Dalí", "Ernst"], correct: 2 },
  { question: "Which artist is known for his Blue Period?", choices: ["Matisse", "Picasso", "Cézanne", "Gauguin"], correct: 1 },
  { question: "Damien Hirst is famous for works involving?", choices: ["Neon lights", "Preserved animals", "Yarn installations", "Sand sculptures"], correct: 1 },
  { question: "The Bauhaus design school originated in which country?", choices: ["France", "USA", "Germany", "Italy"], correct: 2 },
  { question: "Jeff Koons is known for large?", choices: ["Bronze horses", "Mirror-polished balloon animals", "Neon signs", "Oil portraits"], correct: 1 },
  { question: "Which artist co-founded Cubism with Picasso?", choices: ["Fernand Léger", "Juan Gris", "Georges Braque", "Robert Delaunay"], correct: 2 },
  { question: "Frida Kahlo's paintings are strongly associated with her?", choices: ["Abstractions", "Landscapes", "Self-portraits", "Still lifes"], correct: 2 },
  { question: "The readymade 'Fountain' (a urinal) was submitted by?", choices: ["Kurt Schwitters", "Marcel Duchamp", "Tristan Tzara", "Man Ray"], correct: 1 },
  { question: "Wassily Kandinsky is credited with pioneering?", choices: ["Pop Art", "Abstract art", "Photorealism", "Land Art"], correct: 1 },
  { question: "Yoko Ono is associated with which movement?", choices: ["Fluxus", "Futurism", "De Stijl", "Symbolism"], correct: 0 },
  { question: "Which American artist is known for 'Flag' and target paintings?", choices: ["Franz Kline", "Cy Twombly", "Jasper Johns", "Philip Guston"], correct: 2 },
  { question: "The De Stijl movement used only?", choices: ["Earth tones", "Primary colors and black and white", "Pastel shades", "Monochrome"], correct: 1 },
  { question: "Which artist created monochromatic blue paintings called IKB?", choices: ["Yves Klein", "Lucio Fontana", "Piero Manzoni", "Robert Motherwell"], correct: 0 },
  { question: "Banksy is most closely associated with which art form?", choices: ["Sculpture", "Street art / graffiti", "Performance art", "Video art"], correct: 1 },
  { question: "Georgia O'Keeffe is famous for paintings of?", choices: ["Cityscapes", "Flowers and skulls", "Abstract geometry", "Biblical scenes"], correct: 1 },
  { question: "Which movement featured Franz Marc, Wassily Kandinsky, and August Macke?", choices: ["Suprematism", "Der Blaue Reiter", "Die Brücke", "Vorticism"], correct: 1 },
  { question: "Minimalism emerged prominently in which decade?", choices: ["1940s", "1950s", "1960s", "1970s"], correct: 2 },
  { question: "Jean-Michel Basquiat began his career as a?", choices: ["Gallery director", "Street graffiti artist", "Sculptor", "Printmaker"], correct: 1 },
  { question: "Cindy Sherman is best known for?", choices: ["Landscape photography", "Photographic self-portraits in costumes", "Abstract painting", "Performance art"], correct: 1 },
  { question: "Which artist's studio was called 'The Factory'?", choices: ["Roy Lichtenstein", "Andy Warhol", "Robert Indiana", "Claes Oldenburg"], correct: 1 },
  { question: "Mondrian's mature style used which shapes?", choices: ["Circles and ovals", "Triangles and spirals", "Rectangles and straight lines", "Organic curves"], correct: 2 },
  { question: "The term 'Op Art' refers to art that creates?", choices: ["Sound illusions", "Optical illusions", "Tactile illusions", "Olfactory effects"], correct: 1 },
  { question: "Louise Bourgeois is famous for giant?", choices: ["Dog sculptures", "Spider sculptures", "Cat sculptures", "Bird sculptures"], correct: 1 },
  { question: "Which painting technique did Seurat develop?", choices: ["Drip painting", "Pointillism", "Encaustic", "Fresco"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ModernArtQuizSettings): ModernArtQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ModernArtQuizState, action: ModernArtQuizAction): ModernArtQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ModernArtQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
