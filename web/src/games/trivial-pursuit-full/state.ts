// Trivial Pursuit (Full Genus) — 4-player (You + 3 CPUs) wedge-collection board game.
//
// Board geometry (simplified faithful version):
//   - 6 spokes radiate from the outer ring to a central hub.
//   - Outer ring has 42 squares total: 6 HQ squares (one per category) + 36 plain
//     ring squares (6 between each pair of adjacent HQs).
//   - Each spoke has 5 squares between the outer-ring HQ and the center hub
//     (positions 0..4 along the spoke; index 5 is the hub itself).
//   - The 6 HQs are at outer-ring indices 0, 7, 14, 21, 28, 35. Each HQ is the
//     "wedge" square for one of the 6 categories: landing here and answering
//     correctly grants that category's wedge piece.
//
// Movement model (simplified vs. real TP, but playable):
//   - At each HQ a player on the outer ring may EITHER continue around the ring
//     OR descend the matching spoke toward the hub. The reducer's helper
//     chooses based on the player's needs (humans pick interactively via UI).
//   - Roll a d6, move exactly that many squares along a chosen path.
//   - Square color = question category. Center hub is "any category — final".
//
// Win condition: collect all 6 wedges, reach the hub, then answer one final
// question whose category is chosen by the next opponent (we use a random
// category for simplicity).
//
// Advanced rules omitted (noted in howToPlay):
//   - Branching path choice every turn (we auto-route the shortest sensible
//     path: descend toward hub if it brings the player closer to winning,
//     else continue clockwise on the ring).
//   - "Roll again on correct answer" — kept (real rule).
//   - Re-rolls on a 6, multi-die wager variants, "can-of-corn" house rules.
//
// All randomness derives from `mulberry32(seed)` for determinism.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// ---------------------------------------------------------------------------
// Category model
// ---------------------------------------------------------------------------

export type Category = "geography" | "entertainment" | "history" | "arts" | "science" | "sports";
export const CATEGORIES: readonly Category[] = ["geography", "entertainment", "history", "arts", "science", "sports"] as const;
export const CATEGORY_COLORS: Record<Category, string> = {
  geography: "#2c6fc7",      // blue
  entertainment: "#d24b9a",  // pink
  history: "#e6c83a",         // yellow
  arts: "#7a4a2b",            // brown
  science: "#3aa55a",         // green
  sports: "#e08a2a",          // orange
};
export const CATEGORY_LABEL: Record<Category, string> = {
  geography: "Geography",
  entertainment: "Entertainment",
  history: "History",
  arts: "Arts & Literature",
  science: "Science",
  sports: "Sports",
};

// ---------------------------------------------------------------------------
// Board geometry
// ---------------------------------------------------------------------------

export const RING_LEN = 42;                 // 0..41 clockwise around outer ring
export const HQ_INDICES = [0, 7, 14, 21, 28, 35] as const;
export const SPOKE_LEN = 5;                  // squares between HQ and hub (exclusive of HQ, exclusive of hub)

/** Outer ring color at index i — between two HQs the 6 squares cycle through
 *  the 6 categories, ensuring every plain square has a category. */
export function ringCategoryAt(i: number): Category {
  // HQ squares themselves carry the category of their spoke.
  const hqIdx = HQ_INDICES.indexOf(i as 0 | 7 | 14 | 21 | 28 | 35);
  if (hqIdx >= 0) return CATEGORIES[hqIdx]!;
  // Plain squares: use (i mod 6) cycled, but skip the HQ category for the
  // arm to give visual variety.
  return CATEGORIES[i % 6]!;
}

/** Which spoke does outer-ring HQ at index i correspond to (0..5)? */
export function spokeOfHq(i: number): number {
  return HQ_INDICES.indexOf(i as 0 | 7 | 14 | 21 | 28 | 35);
}

/** Color/category for a spoke square. All squares on spoke `s` use that
 *  spoke's category (matching the HQ at its base). */
export function spokeCategoryAt(spoke: number): Category {
  return CATEGORIES[spoke]!;
}

// ---------------------------------------------------------------------------
// Position type — players can be on the ring, on a spoke, or at the hub.
// ---------------------------------------------------------------------------

export type Position =
  | { kind: "ring"; index: number }                // 0..RING_LEN-1
  | { kind: "spoke"; spoke: number; depth: number } // depth 0..SPOKE_LEN-1 (0 = adjacent to HQ, SPOKE_LEN-1 = adjacent to hub)
  | { kind: "hub" };

export function categoryAtPosition(p: Position): Category {
  if (p.kind === "ring") return ringCategoryAt(p.index);
  if (p.kind === "spoke") return spokeCategoryAt(p.spoke);
  // Hub: questions are "wild" — the reducer picks a random category.
  return "geography";
}

// ---------------------------------------------------------------------------
// Question bank — ~150 questions across 6 categories
// ---------------------------------------------------------------------------

export interface Question {
  category: Category;
  question: string;
  choices: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
}

export const QUESTION_BANK: Question[] = [
  // ---------------- Geography (blue) — 25 ----------------
  { category: "geography", question: "Which is the longest river in the world?", choices: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
  { category: "geography", question: "What is the capital of Australia?", choices: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2 },
  { category: "geography", question: "Mount Everest lies between Nepal and which country?", choices: ["India", "Bhutan", "China", "Pakistan"], correct: 2 },
  { category: "geography", question: "The Sahara is mostly in which continent?", choices: ["Asia", "Africa", "Australia", "Europe"], correct: 1 },
  { category: "geography", question: "Which ocean is the largest?", choices: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
  { category: "geography", question: "Lake Baikal is located in which country?", choices: ["Mongolia", "China", "Russia", "Kazakhstan"], correct: 2 },
  { category: "geography", question: "Which country has the most natural lakes?", choices: ["USA", "Russia", "Canada", "Finland"], correct: 2 },
  { category: "geography", question: "Which is the smallest country in the world by area?", choices: ["Monaco", "Vatican City", "Nauru", "San Marino"], correct: 1 },
  { category: "geography", question: "The Strait of Gibraltar separates Europe from which continent?", choices: ["Asia", "Africa", "Antarctica", "South America"], correct: 1 },
  { category: "geography", question: "Which river runs through Paris?", choices: ["Rhine", "Loire", "Seine", "Danube"], correct: 2 },
  { category: "geography", question: "The Andes mountains run primarily through which continent?", choices: ["Africa", "Asia", "Europe", "South America"], correct: 3 },
  { category: "geography", question: "What is the capital of Canada?", choices: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correct: 2 },
  { category: "geography", question: "Mount Kilimanjaro is in which country?", choices: ["Kenya", "Tanzania", "Uganda", "Ethiopia"], correct: 1 },
  { category: "geography", question: "Which sea lies between Italy and Greece?", choices: ["Adriatic", "Ionian", "Aegean", "Tyrrhenian"], correct: 1 },
  { category: "geography", question: "Which country is shaped like a boot?", choices: ["Spain", "Italy", "Greece", "Portugal"], correct: 1 },
  { category: "geography", question: "The Amazon rainforest is mostly in which country?", choices: ["Peru", "Colombia", "Brazil", "Venezuela"], correct: 2 },
  { category: "geography", question: "Which desert is the largest hot desert?", choices: ["Gobi", "Kalahari", "Sahara", "Arabian"], correct: 2 },
  { category: "geography", question: "Which African country was formerly Abyssinia?", choices: ["Eritrea", "Ethiopia", "Somalia", "Sudan"], correct: 1 },
  { category: "geography", question: "What is the capital of New Zealand?", choices: ["Auckland", "Christchurch", "Wellington", "Hamilton"], correct: 2 },
  { category: "geography", question: "Which is the deepest ocean trench?", choices: ["Java", "Mariana", "Tonga", "Puerto Rico"], correct: 1 },
  { category: "geography", question: "The Iberian Peninsula contains Spain and which other country?", choices: ["France", "Italy", "Portugal", "Andorra"], correct: 2 },
  { category: "geography", question: "Which country has Tokyo as its capital?", choices: ["South Korea", "Japan", "China", "Vietnam"], correct: 1 },
  { category: "geography", question: "The Volga River flows through which country?", choices: ["Russia", "Ukraine", "Germany", "Poland"], correct: 0 },
  { category: "geography", question: "Which African country has Cairo as its capital?", choices: ["Libya", "Sudan", "Egypt", "Algeria"], correct: 2 },
  { category: "geography", question: "Which is the largest continent by area?", choices: ["Africa", "Asia", "Europe", "North America"], correct: 1 },

  // ---------------- Entertainment (pink) — 25 ----------------
  { category: "entertainment", question: "Who played Forrest Gump?", choices: ["Tom Cruise", "Tom Hanks", "Brad Pitt", "Kevin Costner"], correct: 1 },
  { category: "entertainment", question: "Which film won Best Picture in 1994?", choices: ["Pulp Fiction", "Schindler's List", "Forrest Gump", "Quiz Show"], correct: 2 },
  { category: "entertainment", question: "Who directed Jurassic Park?", choices: ["George Lucas", "Steven Spielberg", "James Cameron", "Ridley Scott"], correct: 1 },
  { category: "entertainment", question: "Which band released the album Abbey Road?", choices: ["Rolling Stones", "Led Zeppelin", "The Beatles", "Pink Floyd"], correct: 2 },
  { category: "entertainment", question: "Who is the lead singer of U2?", choices: ["Bono", "The Edge", "Adam Clayton", "Larry Mullen Jr."], correct: 0 },
  { category: "entertainment", question: "What show featured the character Walter White?", choices: ["The Wire", "Breaking Bad", "Mad Men", "Better Call Saul"], correct: 1 },
  { category: "entertainment", question: "Who played James Bond in GoldenEye?", choices: ["Sean Connery", "Roger Moore", "Pierce Brosnan", "Timothy Dalton"], correct: 2 },
  { category: "entertainment", question: "Which animated film features the song 'Let It Go'?", choices: ["Tangled", "Frozen", "Moana", "Brave"], correct: 1 },
  { category: "entertainment", question: "Who wrote the lyrics for Hamilton?", choices: ["Stephen Sondheim", "Lin-Manuel Miranda", "Andrew Lloyd Webber", "Tim Rice"], correct: 1 },
  { category: "entertainment", question: "Which sitcom is set at Paddy's Pub in Philadelphia?", choices: ["Cheers", "It's Always Sunny in Philadelphia", "How I Met Your Mother", "Friends"], correct: 1 },
  { category: "entertainment", question: "Which Pixar film features a rat who can cook?", choices: ["Ratatouille", "Up", "Wall-E", "Inside Out"], correct: 0 },
  { category: "entertainment", question: "What instrument does Yo-Yo Ma play?", choices: ["Violin", "Piano", "Cello", "Flute"], correct: 2 },
  { category: "entertainment", question: "Who directed The Godfather?", choices: ["Martin Scorsese", "Francis Ford Coppola", "Stanley Kubrick", "Sidney Lumet"], correct: 1 },
  { category: "entertainment", question: "Which TV show takes place in the fictional town of Pawnee?", choices: ["The Office", "Parks and Recreation", "30 Rock", "Community"], correct: 1 },
  { category: "entertainment", question: "Who is the first host of the Tonight Show?", choices: ["Johnny Carson", "Jay Leno", "Steve Allen", "Conan O'Brien"], correct: 2 },
  { category: "entertainment", question: "What is the name of the dragon in The Hobbit?", choices: ["Drogon", "Smaug", "Falkor", "Toothless"], correct: 1 },
  { category: "entertainment", question: "Which singer is known as the 'Queen of Pop'?", choices: ["Beyonce", "Madonna", "Lady Gaga", "Whitney Houston"], correct: 1 },
  { category: "entertainment", question: "Which actor played Iron Man in the MCU?", choices: ["Chris Evans", "Mark Ruffalo", "Robert Downey Jr.", "Chris Hemsworth"], correct: 2 },
  { category: "entertainment", question: "Who wrote and performed 'Bohemian Rhapsody'?", choices: ["The Who", "Queen", "Led Zeppelin", "Pink Floyd"], correct: 1 },
  { category: "entertainment", question: "What Quentin Tarantino film features a briefcase with mysterious contents?", choices: ["Reservoir Dogs", "Pulp Fiction", "Kill Bill", "Jackie Brown"], correct: 1 },
  { category: "entertainment", question: "Which children's book series features Aslan?", choices: ["Harry Potter", "The Chronicles of Narnia", "His Dark Materials", "Earthsea"], correct: 1 },
  { category: "entertainment", question: "Who composed the score for Star Wars?", choices: ["Hans Zimmer", "Danny Elfman", "John Williams", "James Horner"], correct: 2 },
  { category: "entertainment", question: "Which TV show featured the line 'How you doin'?'?", choices: ["Seinfeld", "Friends", "Cheers", "Frasier"], correct: 1 },
  { category: "entertainment", question: "Which film made Andy Serkis famous through motion capture?", choices: ["Avatar", "King Kong", "The Lord of the Rings", "Planet of the Apes"], correct: 2 },
  { category: "entertainment", question: "Which artist painted 'Campbell's Soup Cans'?", choices: ["Jackson Pollock", "Roy Lichtenstein", "Andy Warhol", "Jasper Johns"], correct: 2 },

  // ---------------- History (yellow) — 25 ----------------
  { category: "history", question: "In what year did World War II end?", choices: ["1942", "1944", "1945", "1947"], correct: 2 },
  { category: "history", question: "Who was the first president of the United States?", choices: ["John Adams", "Thomas Jefferson", "George Washington", "Benjamin Franklin"], correct: 2 },
  { category: "history", question: "The Berlin Wall fell in what year?", choices: ["1987", "1989", "1991", "1993"], correct: 1 },
  { category: "history", question: "Who was the first emperor of Rome?", choices: ["Julius Caesar", "Augustus", "Nero", "Tiberius"], correct: 1 },
  { category: "history", question: "The Magna Carta was signed in what year?", choices: ["1066", "1215", "1314", "1492"], correct: 1 },
  { category: "history", question: "Which empire was ruled by Mansa Musa?", choices: ["Songhai", "Mali", "Ghana", "Ethiopia"], correct: 1 },
  { category: "history", question: "The French Revolution began in what year?", choices: ["1776", "1789", "1799", "1812"], correct: 1 },
  { category: "history", question: "Who was the first female Prime Minister of the UK?", choices: ["Theresa May", "Margaret Thatcher", "Elizabeth I", "Queen Victoria"], correct: 1 },
  { category: "history", question: "Which war featured the Battle of Gettysburg?", choices: ["American Revolution", "War of 1812", "Civil War", "Mexican-American War"], correct: 2 },
  { category: "history", question: "Who painted the ceiling of the Sistine Chapel?", choices: ["Leonardo da Vinci", "Raphael", "Michelangelo", "Donatello"], correct: 2 },
  { category: "history", question: "The Titanic sank in what year?", choices: ["1898", "1905", "1912", "1918"], correct: 2 },
  { category: "history", question: "Who was the longest-reigning British monarch?", choices: ["Victoria", "Elizabeth I", "Elizabeth II", "George III"], correct: 2 },
  { category: "history", question: "The Russian Revolution occurred in what year?", choices: ["1905", "1914", "1917", "1922"], correct: 2 },
  { category: "history", question: "Who wrote the Declaration of Independence?", choices: ["John Adams", "Thomas Jefferson", "Benjamin Franklin", "George Washington"], correct: 1 },
  { category: "history", question: "What year did Columbus reach the Americas?", choices: ["1488", "1492", "1500", "1519"], correct: 1 },
  { category: "history", question: "Which civilization built Machu Picchu?", choices: ["Aztec", "Maya", "Inca", "Olmec"], correct: 2 },
  { category: "history", question: "Who led the Indian independence movement?", choices: ["Nehru", "Gandhi", "Bose", "Patel"], correct: 1 },
  { category: "history", question: "The Cold War was primarily between the USA and which country?", choices: ["China", "Soviet Union", "Cuba", "Germany"], correct: 1 },
  { category: "history", question: "Which Egyptian pharaoh's tomb was found in 1922?", choices: ["Ramses II", "Cleopatra", "Tutankhamun", "Akhenaten"], correct: 2 },
  { category: "history", question: "Who was the first man to walk on the Moon?", choices: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Alan Shepard"], correct: 2 },
  { category: "history", question: "The Hundred Years' War was between which two countries?", choices: ["England and France", "Spain and Portugal", "Germany and Austria", "Russia and Poland"], correct: 0 },
  { category: "history", question: "Which dynasty built much of the Great Wall of China?", choices: ["Han", "Tang", "Ming", "Qing"], correct: 2 },
  { category: "history", question: "Who was assassinated in 1963 in Dallas, Texas?", choices: ["MLK Jr.", "JFK", "RFK", "Malcolm X"], correct: 1 },
  { category: "history", question: "Apartheid was a system of segregation in which country?", choices: ["Zimbabwe", "South Africa", "Nigeria", "Kenya"], correct: 1 },
  { category: "history", question: "The atomic bomb was first dropped on which city?", choices: ["Tokyo", "Nagasaki", "Hiroshima", "Kyoto"], correct: 2 },

  // ---------------- Arts & Literature (brown) — 25 ----------------
  { category: "arts", question: "Who wrote 'Romeo and Juliet'?", choices: ["Christopher Marlowe", "William Shakespeare", "Ben Jonson", "John Webster"], correct: 1 },
  { category: "arts", question: "Who painted the Mona Lisa?", choices: ["Michelangelo", "Raphael", "Leonardo da Vinci", "Caravaggio"], correct: 2 },
  { category: "arts", question: "Which author wrote 'Pride and Prejudice'?", choices: ["Charlotte Bronte", "Jane Austen", "Emily Bronte", "George Eliot"], correct: 1 },
  { category: "arts", question: "Who wrote '1984'?", choices: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "Kurt Vonnegut"], correct: 1 },
  { category: "arts", question: "Which Russian author wrote 'War and Peace'?", choices: ["Dostoevsky", "Tolstoy", "Chekhov", "Pushkin"], correct: 1 },
  { category: "arts", question: "Who painted 'The Starry Night'?", choices: ["Monet", "Van Gogh", "Cezanne", "Gauguin"], correct: 1 },
  { category: "arts", question: "Which poet wrote 'The Raven'?", choices: ["Walt Whitman", "Edgar Allan Poe", "Emily Dickinson", "Robert Frost"], correct: 1 },
  { category: "arts", question: "Who wrote 'The Great Gatsby'?", choices: ["Hemingway", "Fitzgerald", "Faulkner", "Steinbeck"], correct: 1 },
  { category: "arts", question: "Which sculptor created 'David'?", choices: ["Bernini", "Donatello", "Michelangelo", "Rodin"], correct: 2 },
  { category: "arts", question: "Who wrote 'Hamlet'?", choices: ["Marlowe", "Shakespeare", "Jonson", "Kyd"], correct: 1 },
  { category: "arts", question: "Which novelist created Sherlock Holmes?", choices: ["Agatha Christie", "Wilkie Collins", "Arthur Conan Doyle", "G.K. Chesterton"], correct: 2 },
  { category: "arts", question: "Who painted 'Guernica'?", choices: ["Dali", "Picasso", "Miro", "Goya"], correct: 1 },
  { category: "arts", question: "Which author wrote 'Beloved'?", choices: ["Maya Angelou", "Toni Morrison", "Zora Neale Hurston", "Alice Walker"], correct: 1 },
  { category: "arts", question: "Who wrote 'One Hundred Years of Solitude'?", choices: ["Borges", "Garcia Marquez", "Cortazar", "Vargas Llosa"], correct: 1 },
  { category: "arts", question: "Which Greek dramatist wrote 'Oedipus Rex'?", choices: ["Aeschylus", "Sophocles", "Euripides", "Aristophanes"], correct: 1 },
  { category: "arts", question: "Who wrote 'The Odyssey'?", choices: ["Virgil", "Homer", "Hesiod", "Ovid"], correct: 1 },
  { category: "arts", question: "Which Beat author wrote 'On the Road'?", choices: ["Allen Ginsberg", "Jack Kerouac", "William Burroughs", "Gary Snyder"], correct: 1 },
  { category: "arts", question: "Who painted 'The Persistence of Memory'?", choices: ["Magritte", "Dali", "Ernst", "Tanguy"], correct: 1 },
  { category: "arts", question: "Which playwright wrote 'A Streetcar Named Desire'?", choices: ["Arthur Miller", "Tennessee Williams", "Eugene O'Neill", "Edward Albee"], correct: 1 },
  { category: "arts", question: "Who wrote 'Moby-Dick'?", choices: ["Hawthorne", "Melville", "Twain", "Cooper"], correct: 1 },
  { category: "arts", question: "Which artist co-founded Cubism with Picasso?", choices: ["Modigliani", "Braque", "Leger", "Gris"], correct: 1 },
  { category: "arts", question: "Who wrote 'Don Quixote'?", choices: ["Lope de Vega", "Cervantes", "Calderon", "Quevedo"], correct: 1 },
  { category: "arts", question: "Which English Romantic poet wrote 'Ode to a Nightingale'?", choices: ["Wordsworth", "Keats", "Coleridge", "Byron"], correct: 1 },
  { category: "arts", question: "Who wrote 'Crime and Punishment'?", choices: ["Tolstoy", "Dostoevsky", "Gogol", "Turgenev"], correct: 1 },
  { category: "arts", question: "Which Renaissance artist painted 'The Birth of Venus'?", choices: ["Titian", "Botticelli", "Raphael", "Caravaggio"], correct: 1 },

  // ---------------- Science (green) — 25 ----------------
  { category: "science", question: "What is the chemical symbol for gold?", choices: ["Go", "Au", "Ag", "Gd"], correct: 1 },
  { category: "science", question: "How many planets are in the Solar System?", choices: ["7", "8", "9", "10"], correct: 1 },
  { category: "science", question: "What is the speed of light in vacuum (approx)?", choices: ["300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s"], correct: 0 },
  { category: "science", question: "Who developed the theory of general relativity?", choices: ["Newton", "Einstein", "Bohr", "Planck"], correct: 1 },
  { category: "science", question: "What is the most abundant gas in Earth's atmosphere?", choices: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"], correct: 1 },
  { category: "science", question: "What is the basic unit of life?", choices: ["Atom", "Cell", "Molecule", "Organ"], correct: 1 },
  { category: "science", question: "What does DNA stand for?", choices: ["Deoxyribonucleic acid", "Diribonucleic acid", "Dinitric acid", "Dehydroxynucleic acid"], correct: 0 },
  { category: "science", question: "How many bones are in the adult human body?", choices: ["196", "206", "216", "226"], correct: 1 },
  { category: "science", question: "Which planet is known as the Red Planet?", choices: ["Venus", "Mars", "Jupiter", "Mercury"], correct: 1 },
  { category: "science", question: "What is the chemical symbol for sodium?", choices: ["So", "Sn", "Na", "S"], correct: 2 },
  { category: "science", question: "Who proposed the laws of motion?", choices: ["Galileo", "Newton", "Kepler", "Copernicus"], correct: 1 },
  { category: "science", question: "What gas do plants absorb from the air?", choices: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 1 },
  { category: "science", question: "What is the hardest natural substance?", choices: ["Quartz", "Diamond", "Topaz", "Corundum"], correct: 1 },
  { category: "science", question: "Light-years measure what quantity?", choices: ["Time", "Distance", "Mass", "Energy"], correct: 1 },
  { category: "science", question: "Who discovered penicillin?", choices: ["Pasteur", "Fleming", "Curie", "Lister"], correct: 1 },
  { category: "science", question: "What is the pH of pure water?", choices: ["5", "6", "7", "8"], correct: 2 },
  { category: "science", question: "Which organ produces insulin?", choices: ["Liver", "Pancreas", "Kidney", "Spleen"], correct: 1 },
  { category: "science", question: "What is H2O?", choices: ["Salt", "Water", "Hydrogen peroxide", "Ammonia"], correct: 1 },
  { category: "science", question: "Which scientist is known for the Periodic Table?", choices: ["Lavoisier", "Mendeleev", "Bohr", "Dalton"], correct: 1 },
  { category: "science", question: "How many chambers are in the human heart?", choices: ["2", "3", "4", "5"], correct: 2 },
  { category: "science", question: "Which planet has the most moons (as of 2024)?", choices: ["Jupiter", "Saturn", "Uranus", "Neptune"], correct: 1 },
  { category: "science", question: "What is the largest organ in the human body?", choices: ["Liver", "Brain", "Skin", "Lungs"], correct: 2 },
  { category: "science", question: "Which is the smallest particle of an element?", choices: ["Molecule", "Atom", "Electron", "Proton"], correct: 1 },
  { category: "science", question: "What is the unit of electrical resistance?", choices: ["Volt", "Ampere", "Ohm", "Watt"], correct: 2 },
  { category: "science", question: "Which gas is most associated with the greenhouse effect?", choices: ["Oxygen", "Carbon Dioxide", "Helium", "Neon"], correct: 1 },

  // ---------------- Sports (orange) — 25 ----------------
  { category: "sports", question: "How many players are on a soccer team on the field?", choices: ["9", "10", "11", "12"], correct: 2 },
  { category: "sports", question: "In which sport is the Stanley Cup awarded?", choices: ["Basketball", "Baseball", "Hockey", "Football"], correct: 2 },
  { category: "sports", question: "Who holds the all-time Grand Slam record (men's tennis, as of 2024)?", choices: ["Federer", "Nadal", "Djokovic", "Sampras"], correct: 2 },
  { category: "sports", question: "What is the maximum break in snooker?", choices: ["147", "155", "180", "200"], correct: 0 },
  { category: "sports", question: "Which country invented table tennis?", choices: ["China", "Japan", "England", "Korea"], correct: 2 },
  { category: "sports", question: "How many points is a touchdown worth in American football?", choices: ["3", "6", "7", "8"], correct: 1 },
  { category: "sports", question: "What sport uses a shuttlecock?", choices: ["Squash", "Badminton", "Tennis", "Pickleball"], correct: 1 },
  { category: "sports", question: "Which boxer was 'The Greatest'?", choices: ["Mike Tyson", "Muhammad Ali", "Joe Frazier", "Floyd Mayweather"], correct: 1 },
  { category: "sports", question: "Where were the 1992 Summer Olympics held?", choices: ["Atlanta", "Sydney", "Barcelona", "Seoul"], correct: 2 },
  { category: "sports", question: "How long is a marathon?", choices: ["26.2 miles", "21.1 miles", "30 miles", "20 miles"], correct: 0 },
  { category: "sports", question: "Who broke Babe Ruth's home run record in 1974?", choices: ["Mickey Mantle", "Hank Aaron", "Willie Mays", "Roger Maris"], correct: 1 },
  { category: "sports", question: "Which sport awards the Vince Lombardi Trophy?", choices: ["MLB", "NBA", "NFL", "NHL"], correct: 2 },
  { category: "sports", question: "Wimbledon is played on what surface?", choices: ["Clay", "Hard", "Grass", "Carpet"], correct: 2 },
  { category: "sports", question: "How many holes are in a standard round of golf?", choices: ["9", "12", "18", "20"], correct: 2 },
  { category: "sports", question: "Which country has won the most FIFA World Cups (as of 2022)?", choices: ["Germany", "Argentina", "Brazil", "Italy"], correct: 2 },
  { category: "sports", question: "Who has scored the most goals in NHL history?", choices: ["Mario Lemieux", "Wayne Gretzky", "Sidney Crosby", "Gordie Howe"], correct: 1 },
  { category: "sports", question: "What is the diameter of a basketball hoop in inches?", choices: ["16", "18", "20", "24"], correct: 1 },
  { category: "sports", question: "In cricket, how many runs is a 'six' worth?", choices: ["4", "5", "6", "8"], correct: 2 },
  { category: "sports", question: "What does NBA stand for?", choices: ["National Basketball Association", "North Basketball Alliance", "New Ball Association", "National Best Athletes"], correct: 0 },
  { category: "sports", question: "How many Olympic gold medals does Michael Phelps have?", choices: ["18", "21", "23", "25"], correct: 2 },
  { category: "sports", question: "Which Formula 1 driver won 7 world championships and tied a record?", choices: ["Senna", "Schumacher", "Hamilton", "Both Schumacher and Hamilton"], correct: 3 },
  { category: "sports", question: "How many laps in the Indianapolis 500?", choices: ["200", "300", "400", "500"], correct: 0 },
  { category: "sports", question: "Which country invented rugby?", choices: ["France", "England", "Wales", "New Zealand"], correct: 1 },
  { category: "sports", question: "In bowling, what is a 'turkey'?", choices: ["Three strikes in a row", "Two strikes", "A split", "A spare"], correct: 0 },
  { category: "sports", question: "Which baseball team has won the most World Series?", choices: ["Dodgers", "Cardinals", "Yankees", "Red Sox"], correct: 2 },
];

// ---------------------------------------------------------------------------
// Player + settings
// ---------------------------------------------------------------------------

export const NUM_PLAYERS = 4;
export const HUMAN_SEAT = 0;
export const CPU_ACCURACY = 0.6; // 60% chance the CPU answers correctly
export const PLAYER_COLORS = ["#1f8fff", "#ff5555", "#33cc66", "#cc6633"] as const;
export const PLAYER_NAMES = ["You", "CPU Aida", "CPU Bram", "CPU Carla"] as const;

export interface Player {
  pos: Position;
  wedges: Record<Category, boolean>;
}

export interface TrivialPursuitFullSettings { _dummy: boolean }

// ---------------------------------------------------------------------------
// State + actions
// ---------------------------------------------------------------------------

export type Phase =
  | "rolling"          // current player about to roll the die
  | "choosingPath"     // human player needs to decide ring-vs-spoke (only when at a HQ)
  | "question"         // a question is presented for the current player
  | "result"           // answer outcome is shown — user clicks Continue (human only)
  | "finalQuestion"    // current player has all 6 wedges + reached hub
  | "done";

export interface TrivialPursuitFullState {
  rngSeed: number;
  players: Player[];
  turn: number;             // 0..NUM_PLAYERS-1
  phase: Phase;
  die: number;              // last d6 result, 1..6 (0 before first roll)
  stepsLeft: number;        // steps remaining in current move
  // When at a fork (on a HQ with steps remaining) we need user input.
  pathChoices: PathChoice[];
  question: Question | null;
  selected: number | null;  // for the human's answer
  lastCorrect: boolean | null;
  log: string[];            // ring buffer of recent events (last 6)
  winner: number | null;
  score: number;
  // When phase === "result", this holds the state to transition into when
  // the human presses Continue. We hold it here so the question/answer
  // outcome remains visible.
  pendingNext: TrivialPursuitFullState | null;
}

export type PathChoice =
  | { kind: "ring" }    // keep going clockwise on the ring
  | { kind: "spoke" };  // descend the spoke toward the hub

export type TrivialPursuitFullAction =
  | { type: "roll" }
  | { type: "choosePath"; choice: PathChoice }
  | { type: "selectAnswer"; choice: number }
  | { type: "submitAnswer" }
  | { type: "continue" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rollDie(seed: number): { value: number; nextSeed: number } {
  const r = mulberry32(seed);
  const v = 1 + Math.floor(r() * 6);
  // Advance seed for repeatability.
  return { value: v, nextSeed: Math.floor(r() * 2 ** 31) };
}

function emptyWedges(): Record<Category, boolean> {
  return { geography: false, entertainment: false, history: false, arts: false, science: false, sports: false };
}

function makePlayer(): Player {
  // All players start on the hub-adjacent center? Real TP starts on the hub
  // itself. We start them on the hub and they must first roll out via a spoke.
  return { pos: { kind: "hub" }, wedges: emptyWedges() };
}

export function hasAllWedges(p: Player): boolean {
  return CATEGORIES.every(c => p.wedges[c]);
}

function pushLog(state: TrivialPursuitFullState, msg: string): string[] {
  const next = [...state.log, msg];
  return next.slice(Math.max(0, next.length - 6));
}

// ---------------------------------------------------------------------------
// Question selection
// ---------------------------------------------------------------------------

function pickQuestion(seed: number, category: Category): { q: Question; nextSeed: number } {
  const r = mulberry32(seed);
  const pool = QUESTION_BANK.filter(q => q.category === category);
  // Always at least one — bank has 25 per category.
  const idx = Math.floor(r() * pool.length);
  return { q: pool[idx]!, nextSeed: Math.floor(r() * 2 ** 31) };
}

// ---------------------------------------------------------------------------
// Movement
// ---------------------------------------------------------------------------

/** Available choices at the current position if the player has remaining
 *  steps. Returns at most 2 (continue ring vs. descend spoke). */
function pathChoicesAt(pos: Position): PathChoice[] {
  if (pos.kind === "ring") {
    const onHq = HQ_INDICES.indexOf(pos.index as 0 | 7 | 14 | 21 | 28 | 35) >= 0;
    if (onHq) return [{ kind: "ring" }, { kind: "spoke" }];
    return [{ kind: "ring" }];
  }
  // Spoke and hub squares have no fork — moves along the spoke / out to ring.
  return [{ kind: "ring" }]; // dummy, won't be used
}

/** Apply ONE step of movement in a chosen direction. Returns next position
 *  and whether the move is finished (e.g. hub reached). */
function stepOnce(pos: Position, choice: PathChoice): Position {
  if (pos.kind === "hub") {
    // From the hub you can only descend onto a spoke. We default to the first
    // category's spoke (spoke 0). The actual spoke chosen for hub-exit is
    // handled separately via choice; for our simplified model rolling from
    // the hub always exits onto spoke 0. (Advanced rules omitted: choose
    // which spoke to exit from.)
    return { kind: "spoke", spoke: 0, depth: SPOKE_LEN - 1 };
  }
  if (pos.kind === "spoke") {
    // Moving toward hub if depth==SPOKE_LEN-1 is adjacent to hub. If choice
    // is ring, move outward; otherwise move inward.
    if (choice.kind === "ring") {
      // moving outward
      if (pos.depth === 0) {
        // pop out to the ring HQ at this spoke
        return { kind: "ring", index: HQ_INDICES[pos.spoke]! };
      }
      return { kind: "spoke", spoke: pos.spoke, depth: pos.depth - 1 };
    }
    // choice.kind === "spoke" — going inward toward the hub
    if (pos.depth === SPOKE_LEN - 1) {
      return { kind: "hub" };
    }
    return { kind: "spoke", spoke: pos.spoke, depth: pos.depth + 1 };
  }
  // pos.kind === "ring"
  if (choice.kind === "spoke") {
    const sp = spokeOfHq(pos.index);
    if (sp >= 0) return { kind: "spoke", spoke: sp, depth: 0 };
    // not on a HQ — defensive fallback (shouldn't happen)
    return { kind: "ring", index: (pos.index + 1) % RING_LEN };
  }
  // choice.kind === "ring" — step clockwise
  return { kind: "ring", index: (pos.index + 1) % RING_LEN };
}

/** AI route planner: decide a path choice automatically for a CPU.
 *  Goal-oriented heuristic:
 *    - If on a HQ matching a wedge we still need, descend the spoke.
 *    - If we already have all wedges, descend toward hub when on any HQ.
 *    - Otherwise continue on the ring.
 *    - If on a spoke heading outward by default unless we have all wedges. */
function chooseCpuPath(player: Player, pos: Position): PathChoice {
  if (pos.kind === "ring") {
    const onHq = HQ_INDICES.indexOf(pos.index as 0 | 7 | 14 | 21 | 28 | 35) >= 0;
    if (!onHq) return { kind: "ring" };
    const sp = spokeOfHq(pos.index);
    const cat = CATEGORIES[sp]!;
    if (hasAllWedges(player)) return { kind: "spoke" }; // race for hub
    if (!player.wedges[cat]) return { kind: "spoke" }; // grab this wedge
    return { kind: "ring" };
  }
  if (pos.kind === "spoke") {
    // If on a spoke for a wedge we need, keep going toward... wait, the
    // wedge is at the OUTER end (the HQ on the ring). So heading outward
    // wins the wedge. If we have all wedges, head inward to hub.
    if (hasAllWedges(player)) return { kind: "spoke" }; // inward
    return { kind: "ring" }; // outward
  }
  return { kind: "ring" };
}

/** Resolve movement for the current player: apply `stepsLeft` movements,
 *  pausing for human input if a HQ fork is encountered. Returns updated
 *  state. */
function resolveMovement(state: TrivialPursuitFullState): TrivialPursuitFullState {
  let s = state;
  let pos = s.players[s.turn]!.pos;
  let steps = s.stepsLeft;

  while (steps > 0) {
    // Detect fork before consuming the step.
    if (pos.kind === "ring") {
      const onHq = HQ_INDICES.indexOf(pos.index as 0 | 7 | 14 | 21 | 28 | 35) >= 0;
      if (onHq && s.turn === HUMAN_SEAT) {
        // Pause for human path choice.
        const choices = pathChoicesAt(pos);
        const players = s.players.slice();
        players[s.turn] = { ...players[s.turn]!, pos };
        return { ...s, players, stepsLeft: steps, pathChoices: choices, phase: "choosingPath" };
      }
    }
    // From the hub, CPU automatic exit is via spoke 0 (simplified). Humans
    // get a question prompt at the hub immediately if they stopped there.
    // For now, picking a default for non-hub squares:
    let choice: PathChoice;
    if (s.turn === HUMAN_SEAT) {
      // Default human movement when no fork: keep going in the natural direction.
      if (pos.kind === "spoke") {
        // If the player has all wedges, prefer toward the hub. Otherwise outward.
        choice = hasAllWedges(s.players[s.turn]!) ? { kind: "spoke" } : { kind: "ring" };
      } else if (pos.kind === "hub") {
        // From the hub a human must roll back out — pick spoke 0 by default.
        choice = { kind: "spoke" };
      } else {
        choice = { kind: "ring" };
      }
    } else {
      choice = chooseCpuPath(s.players[s.turn]!, pos);
      if (pos.kind === "hub") {
        // CPU exits hub via spoke 0 always (simplified).
        choice = { kind: "spoke" };
      }
    }
    pos = stepOnce(pos, choice);
    steps -= 1;
  }

  const players = s.players.slice();
  players[s.turn] = { ...players[s.turn]!, pos };
  s = { ...s, players, stepsLeft: 0, pathChoices: [] };
  return s;
}

/** After movement is complete, present a question for the square the player
 *  landed on. */
function presentQuestion(state: TrivialPursuitFullState): TrivialPursuitFullState {
  const player = state.players[state.turn]!;
  const at = player.pos;
  // Final question fires when the player is on the hub AND has all 6 wedges.
  if (at.kind === "hub" && hasAllWedges(player)) {
    // Random category for the final question, deterministic via rng.
    const r = mulberry32(state.rngSeed);
    const cat = CATEGORIES[Math.floor(r() * CATEGORIES.length)]!;
    const nextSeed = Math.floor(r() * 2 ** 31);
    const pick = pickQuestion(nextSeed, cat);
    return {
      ...state,
      rngSeed: pick.nextSeed,
      question: pick.q,
      selected: null,
      phase: "finalQuestion",
    };
  }
  if (at.kind === "hub") {
    // Stopped on hub without all wedges — no question. Skip to next turn.
    const nextTurn = (state.turn + 1) % NUM_PLAYERS;
    const log = pushLog(state, `${PLAYER_NAMES[state.turn]} rests at the hub (needs all wedges to win).`);
    return { ...state, turn: nextTurn, phase: "rolling", die: 0, question: null, selected: null, log };
  }
  const cat = categoryAtPosition(at);
  const pick = pickQuestion(state.rngSeed, cat);
  return {
    ...state,
    rngSeed: pick.nextSeed,
    question: pick.q,
    selected: null,
    phase: "question",
  };
}

/** CPU picks an answer choice. With probability CPU_ACCURACY it answers
 *  correctly; otherwise it picks a wrong choice deterministically. */
function cpuChooseAnswer(seed: number, q: Question): { choice: number; nextSeed: number } {
  const r = mulberry32(seed);
  const roll = r();
  if (roll < CPU_ACCURACY) {
    return { choice: q.correct, nextSeed: Math.floor(r() * 2 ** 31) };
  }
  // Pick a wrong choice
  const wrongs = [0, 1, 2, 3].filter(i => i !== q.correct);
  const idx = wrongs[Math.floor(r() * wrongs.length)]!;
  return { choice: idx, nextSeed: Math.floor(r() * 2 ** 31) };
}

/** Apply answer outcome: award wedge if on matching HQ, possibly end game,
 *  and decide whether the player goes again or turn passes. */
function applyAnswer(state: TrivialPursuitFullState, correct: boolean): TrivialPursuitFullState {
  const pl = state.players[state.turn]!;
  let newPlayers = state.players.slice();
  let log = state.log;

  if (state.phase === "finalQuestion") {
    if (correct) {
      // WIN! Score = 600 + (6 - turn idx) tiny tiebreaker. Human only wins
      // gives full score; CPUs winning give 0.
      const isHuman = state.turn === HUMAN_SEAT;
      log = pushLog({ ...state, log }, isHuman ? "You answered the FINAL question correctly. You win!" : `${PLAYER_NAMES[state.turn]} won the final question!`);
      return { ...state, players: newPlayers, log, winner: state.turn, phase: "done", score: isHuman ? 1000 : 0, lastCorrect: true, pendingNext: null };
    }
    // Miss the final — turn passes; player remains at hub.
    log = pushLog({ ...state, log }, `${PLAYER_NAMES[state.turn]} missed the final question.`);
    const nextTurn = (state.turn + 1) % NUM_PLAYERS;
    return { ...state, players: newPlayers, log, turn: nextTurn, phase: "rolling", die: 0, question: null, selected: null, lastCorrect: false, pendingNext: null };
  }

  // Regular question
  const at = pl.pos;
  const onHq = at.kind === "ring" && HQ_INDICES.indexOf(at.index as 0 | 7 | 14 | 21 | 28 | 35) >= 0;
  if (correct && onHq) {
    // Award the wedge for this HQ's category.
    const sp = spokeOfHq(at.index as number);
    const cat = CATEGORIES[sp]!;
    if (!pl.wedges[cat]) {
      const w = { ...pl.wedges, [cat]: true };
      newPlayers[state.turn] = { ...pl, wedges: w };
      log = pushLog({ ...state, log }, `${PLAYER_NAMES[state.turn]} won the ${CATEGORY_LABEL[cat]} wedge!`);
    } else {
      log = pushLog({ ...state, log }, `${PLAYER_NAMES[state.turn]} answered correctly (already had this wedge).`);
    }
  } else if (correct) {
    log = pushLog({ ...state, log }, `${PLAYER_NAMES[state.turn]} answered correctly.`);
  } else {
    log = pushLog({ ...state, log }, `${PLAYER_NAMES[state.turn]} answered incorrectly.`);
  }

  // Correct => same player rolls again. Wrong => next player's turn.
  if (correct) {
    return {
      ...state,
      players: newPlayers,
      log,
      phase: "rolling",
      die: 0,
      question: null,
      selected: null,
      lastCorrect: true,
      pendingNext: null,
    };
  }
  const nextTurn = (state.turn + 1) % NUM_PLAYERS;
  return {
    ...state,
    players: newPlayers,
    log,
    turn: nextTurn,
    phase: "rolling",
    die: 0,
    question: null,
    selected: null,
    lastCorrect: false,
    pendingNext: null,
  };
}

/** Drive any active CPU turns automatically until it's the human's turn or
 *  the game ends. Bounded by a safety counter. */
function driveCpus(state: TrivialPursuitFullState): TrivialPursuitFullState {
  let s = state;
  let safety = 64; // bounded — should always converge
  while (safety-- > 0 && s.phase !== "done") {
    if (s.turn === HUMAN_SEAT) break;
    if (s.phase === "rolling") {
      // CPU rolls.
      const r = rollDie(s.rngSeed);
      s = { ...s, rngSeed: r.nextSeed, die: r.value, stepsLeft: r.value };
      // Resolve movement for CPU (auto-routing, no fork prompts).
      s = resolveMovement(s);
      // Present question
      s = presentQuestion(s);
      continue;
    }
    if (s.phase === "question" || s.phase === "finalQuestion") {
      // CPU answers.
      const pick = cpuChooseAnswer(s.rngSeed, s.question!);
      s = { ...s, rngSeed: pick.nextSeed, selected: pick.choice };
      const correct = pick.choice === s.question!.correct;
      s = applyAnswer(s, correct);
      continue;
    }
    if (s.phase === "result") {
      // Shouldn't happen for CPU but defensive.
      s = { ...s, phase: "rolling" };
      continue;
    }
    if (s.phase === "choosingPath") {
      // Shouldn't happen for CPU (resolveMovement auto-routes CPUs) but
      // defensive: clear the prompt and continue.
      s = { ...s, pathChoices: [], phase: "rolling" };
      continue;
    }
    break;
  }
  return s;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initialState(seed: number, _settings: TrivialPursuitFullSettings): TrivialPursuitFullState {
  // Derive a sub-seed for the first action — keeps determinism stable.
  const r = mulberry32(seed);
  // Burn a few cycles so seed 0 is well-mixed, then snapshot a stable seed.
  r(); r();
  const rngSeed = Math.floor(r() * 2 ** 31);
  return {
    rngSeed,
    players: Array.from({ length: NUM_PLAYERS }, () => makePlayer()),
    turn: 0,
    phase: "rolling",
    die: 0,
    stepsLeft: 0,
    pathChoices: [],
    question: null,
    selected: null,
    lastCorrect: null,
    log: ["Roll the die to begin."],
    winner: null,
    score: 0,
    pendingNext: null,
  };
}

export function reducer(state: TrivialPursuitFullState, action: TrivialPursuitFullAction): TrivialPursuitFullState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "roll": {
      if (state.phase !== "rolling" || state.turn !== HUMAN_SEAT) return state;
      const r = rollDie(state.rngSeed);
      let s: TrivialPursuitFullState = { ...state, rngSeed: r.nextSeed, die: r.value, stepsLeft: r.value };
      s = resolveMovement(s);
      if (s.phase === "choosingPath") return s;
      s = presentQuestion(s);
      return s;
    }
    case "choosePath": {
      if (state.phase !== "choosingPath" || state.turn !== HUMAN_SEAT) return state;
      // Apply ONE step in the chosen direction, then continue resolving.
      const player = state.players[state.turn]!;
      const nextPos = stepOnce(player.pos, action.choice);
      const players = state.players.slice();
      players[state.turn] = { ...player, pos: nextPos };
      let s: TrivialPursuitFullState = { ...state, players, stepsLeft: state.stepsLeft - 1, pathChoices: [], phase: "rolling" };
      // resolveMovement expects phase==="rolling" but it doesn't check phase —
      // it just walks stepsLeft. We re-enter and complete.
      s = resolveMovement(s);
      if (s.phase === "choosingPath") return s;
      s = presentQuestion(s);
      return s;
    }
    case "selectAnswer": {
      if (state.phase !== "question" && state.phase !== "finalQuestion") return state;
      if (state.turn !== HUMAN_SEAT) return state;
      if (action.choice < 0 || action.choice > 3) return state;
      return { ...state, selected: action.choice };
    }
    case "submitAnswer": {
      if (state.phase !== "question" && state.phase !== "finalQuestion") return state;
      if (state.turn !== HUMAN_SEAT) return state;
      if (state.selected === null) return state;
      const correct = state.selected === state.question!.correct;
      // Compute the post-answer state immediately.
      const postAnswer = applyAnswer(state, correct);
      // If the game ended on a winning final question, jump straight to done.
      if (postAnswer.phase === "done") return postAnswer;
      // Show a "result" panel; stash the real transition for "continue".
      return { ...state, phase: "result", lastCorrect: correct, pendingNext: postAnswer };
    }
    case "continue": {
      if (state.phase !== "result") return state;
      const post = state.pendingNext;
      if (!post) {
        // Defensive fallback — just clear the result phase.
        return { ...state, phase: "rolling", question: null, selected: null, pendingNext: null };
      }
      // Drive any CPU turns until it's the human's turn again or game ends.
      const driven = driveCpus({ ...post, pendingNext: null });
      return driven;
    }
    default:
      return state;
  }
}

export function isTerminal(state: TrivialPursuitFullState): { score: number } | null {
  return state.phase === "done" ? { score: state.score } : null;
}
