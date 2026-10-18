import { tr } from './i18n';

// The question of the day in the Stube (Marco, 2026-10-18: testers lose
// interest once the journey is done). Every day one new memory question, the
// same for everyone on that day, so a family can talk about it. An answer is
// a new page in the memory book (kind "note", id "dq-<day>"), so the book
// never stops growing. The family question of the week (lib/familyBook.ts)
// comes from its own list below.

const DAILY: [en: string, de: string][] = [
  ['What did Sunday lunch at your grandparents’ smell like?', 'Wie roch es sonntags beim Mittagessen bei deinen Großeltern?'],
  ['Which toy did you want so badly that you can still picture it?', 'Welches Spielzeug wolltest du so sehr, dass du es heute noch vor dir siehst?'],
  ['Who was your best friend in primary school, and what did you get up to?', 'Wer war dein bester Freund oder deine beste Freundin in der Grundschule, und was habt ihr angestellt?'],
  ['What was the first record, tape or CD you bought yourself?', 'Was war die erste Platte, Kassette oder CD, die du dir selbst gekauft hast?'],
  ['Which TV show did the whole family watch together?', 'Welche Fernsehsendung hat die ganze Familie zusammen geschaut?'],
  ['What did your childhood bedroom look like?', 'Wie sah dein Kinderzimmer aus?'],
  ['Which sweets from the corner shop did you love most?', 'Welche Süßigkeiten vom Kiosk mochtest du am liebsten?'],
  ['Where did your family go on holiday, and what do you remember most?', 'Wohin ging es in den Urlaub, und woran erinnerst du dich am meisten?'],
  ['What was your favorite game in the schoolyard?', 'Was war dein liebstes Spiel auf dem Schulhof?'],
  ['Which teacher do you still remember, and why?', 'An welche Lehrerin oder welchen Lehrer erinnerst du dich noch, und warum?'],
  ['How did you celebrate your birthdays as a child?', 'Wie hast du als Kind Geburtstag gefeiert?'],
  ['What did you want to be when you grew up?', 'Was wolltest du werden, wenn du groß bist?'],
  ['Which song takes you straight back to your teens?', 'Welches Lied bringt dich sofort zurück in deine Jugend?'],
  ['What was the first thing you saved up for?', 'Worauf hast du als Erstes gespart?'],
  ['What did your parents’ car look like, and where did you sit?', 'Wie sah das Auto deiner Eltern aus, und wo hast du gesessen?'],
  ['What was a typical Saturday like when you were ten?', 'Wie sah ein ganz normaler Samstag aus, als du zehn warst?'],
  ['Which smell reminds you of your childhood home?', 'Welcher Geruch erinnert dich an dein Elternhaus?'],
  ['What was your first pet, or the pet you always wanted?', 'Was war dein erstes Haustier, oder welches hättest du gern gehabt?'],
  ['Which dish did your mother or father make best?', 'Welches Gericht konnte deine Mutter oder dein Vater am besten?'],
  ['What did you do on rainy afternoons?', 'Was hast du an verregneten Nachmittagen gemacht?'],
  ['Which comic, book or magazine did you devour?', 'Welches Comic, Buch oder Heft hast du verschlungen?'],
  ['What was your first job, and what did you earn?', 'Was war dein erster Job, und was hast du verdient?'],
  ['Who taught you to ride a bike, and how did it go?', 'Wer hat dir Fahrradfahren beigebracht, und wie lief es?'],
  ['What did your first school bag look like?', 'Wie sah dein erster Schulranzen aus?'],
  ['Which fashion did you wear proudly that makes you smile today?', 'Welche Mode hast du stolz getragen, über die du heute schmunzelst?'],
  ['Where did you and your friends hang out?', 'Wo habt ihr euch als Jugendliche getroffen?'],
  ['What was the best present you ever got as a child?', 'Was war das schönste Geschenk deiner Kindheit?'],
  ['What did Christmas Eve look like in your family?', 'Wie sah Heiligabend bei euch zu Hause aus?'],
  ['Which film did you see at the cinema and never forget?', 'Welchen Film hast du im Kino gesehen und nie vergessen?'],
  ['What did you get up to that your parents never found out about?', 'Was hast du angestellt, das deine Eltern nie erfahren haben?'],
  ['Which household gadget was the big new thing at home?', 'Welches Gerät war bei euch zu Hause die große Neuheit?'],
  ['How did you talk to friends before everyone had a phone in their pocket?', 'Wie hast du dich mit Freunden verabredet, bevor jeder ein Handy hatte?'],
  ['What did your grandparents tell you about their own youth?', 'Was haben dir deine Großeltern von ihrer eigenen Jugend erzählt?'],
  ['What was your favorite place to hide?', 'Wo war dein liebstes Versteck?'],
  ['Which sport or club were you in?', 'In welchem Sport oder Verein warst du?'],
  ['What did the street you grew up on look like?', 'Wie sah die Straße aus, in der du aufgewachsen bist?'],
  ['What was your first concert or big festival?', 'Was war dein erstes Konzert oder großes Fest?'],
  ['Which school trip do you still remember?', 'An welche Klassenfahrt erinnerst du dich noch?'],
  ['What was in your pockets as a kid?', 'Was hattest du als Kind in den Hosentaschen?'],
  ['Which word or saying did everyone use back then?', 'Welches Wort oder welchen Spruch hat damals jeder gesagt?'],
  ['What did summer holidays at home feel like?', 'Wie fühlten sich Sommerferien zu Hause an?'],
  ['Who was your first crush?', 'Wer war dein erster Schwarm?'],
  ['What did you have for breakfast before school?', 'Was gab es vor der Schule zum Frühstück?'],
  ['Which poster hung on your wall?', 'Welches Poster hing bei dir an der Wand?'],
  ['What was the most exciting news you remember from your youth?', 'Welche Nachricht aus deiner Jugend hat dich am meisten bewegt?'],
  ['Which game did you play with your family in the evening?', 'Welches Spiel habt ihr abends in der Familie gespielt?'],
  ['How did you spend your pocket money?', 'Wofür hast du dein Taschengeld ausgegeben?'],
  ['What did your first own room or flat look like?', 'Wie sah dein erstes eigenes Zimmer oder deine erste Wohnung aus?'],
  ['Which neighbor do you still think of?', 'An welche Nachbarin oder welchen Nachbarn denkst du heute noch?'],
  ['What was the snowiest winter you remember?', 'Welcher Winter war der schneereichste, an den du dich erinnerst?'],
  ['Which radio show or DJ did you listen to?', 'Welche Radiosendung oder welchen Moderator hast du gehört?'],
  ['What was your proudest moment at school?', 'Was war dein stolzester Moment in der Schule?'],
  ['What did a visit to the doctor or dentist feel like back then?', 'Wie war ein Besuch beim Arzt oder Zahnarzt damals?'],
  ['Which shop in town did you love to look around in?', 'In welchem Laden in der Stadt hast du am liebsten gestöbert?'],
  ['What did you build, sew or tinker with your own hands?', 'Was hast du mit eigenen Händen gebaut, genäht oder gebastelt?'],
  ['Which rule at home did you find unfair?', 'Welche Regel zu Hause fandest du ungerecht?'],
  ['What did your first phone look like, and whom did you call?', 'Wie sah dein erstes Telefon aus, und wen hast du angerufen?'],
  ['Which day from your childhood would you like to live again?', 'Welchen Tag aus deiner Kindheit würdest du gern noch einmal erleben?'],
  ['What did your family do on Sunday afternoons?', 'Was hat deine Familie sonntagnachmittags gemacht?'],
  ['Which dance or party do you remember from your teens?', 'An welche Tanzstunde oder Party aus deiner Jugend erinnerst du dich?'],
  ['Who was your hero when you were young?', 'Wer war dein großes Vorbild, als du jung warst?'],
  ['What was the first meal you cooked yourself?', 'Was war das erste Essen, das du selbst gekocht hast?'],
  ['Which car, motorbike or moped did you dream of?', 'Von welchem Auto, Motorrad oder Mofa hast du geträumt?'],
  ['What was the funniest thing that happened on a family outing?', 'Was war das Lustigste, das bei einem Familienausflug passiert ist?'],
  ['What did you collect as a child?', 'Was hast du als Kind gesammelt?'],
  ['Which piece of advice from back then has stayed with you?', 'Welcher Rat von damals ist dir geblieben?'],
  ['What did the kitchen look like where you grew up?', 'Wie sah die Küche aus, in der du aufgewachsen bist?'],
  ['Which smell or sound means summer to you?', 'Welcher Geruch oder welches Geräusch bedeutet für dich Sommer?'],
  ['What would you tell your ten-year-old self today?', 'Was würdest du deinem zehnjährigen Ich heute sagen?'],
  ['Which moment with your siblings or cousins do you remember fondly?', 'An welchen Moment mit Geschwistern oder Cousins denkst du gern zurück?'],
];

// The family question of the week: one the whole family answers and reads together.
const FAMILY: [en: string, de: string][] = [
  ['What is your earliest memory?', 'Was ist deine früheste Erinnerung?'],
  ['Which family celebration do you remember best?', 'An welches Familienfest erinnerst du dich am liebsten?'],
  ['What did you play with the others in this family as a child?', 'Was hast du als Kind mit den anderen aus dieser Familie gespielt?'],
  ['Which family recipe should never be forgotten?', 'Welches Familienrezept darf nie vergessen werden?'],
  ['Which holiday together do you still talk about?', 'Von welchem gemeinsamen Urlaub erzählt ihr heute noch?'],
  ['What did you learn from your grandparents?', 'Was hast du von deinen Großeltern gelernt?'],
  ['Which story about this family should the grandchildren know?', 'Welche Geschichte über diese Familie sollten die Enkel kennen?'],
  ['What was the first home you remember like?', 'Wie war die erste Wohnung, an die du dich erinnerst?'],
  ['Which song do you connect with someone in this family?', 'Welches Lied verbindest du mit jemandem aus dieser Familie?'],
  ['What was Christmas like in this family when you were small?', 'Wie war Weihnachten in dieser Familie, als du klein warst?'],
  ['Which mischief from back then can finally be confessed?', 'Welchen Streich von damals darf man jetzt endlich beichten?'],
  ['Who in this family made you laugh the most, and how?', 'Wer in dieser Familie hat dich am meisten zum Lachen gebracht, und wie?'],
  ['What was your first day at school like?', 'Wie war dein erster Schultag?'],
  ['Which object from back then would you love to hold again?', 'Welchen Gegenstand von damals würdest du gern noch einmal in der Hand halten?'],
  ['How did you meet your partner or your best friend?', 'Wie hast du deinen Partner, deine Partnerin oder deine beste Freundschaft kennengelernt?'],
  ['What did you do on summer evenings as a teenager?', 'Was hast du als Jugendliche:r an Sommerabenden gemacht?'],
  ['What was the most adventurous thing you did when you were young?', 'Was war das Abenteuerlichste, das du als junger Mensch gemacht hast?'],
  ['Which family tradition would you like to keep alive?', 'Welche Familientradition möchtest du am Leben halten?'],
  ['Which photo of you as a child do you like most, and why?', 'Welches Kinderfoto von dir magst du am liebsten, und warum?'],
  ['What did a normal school day look like for you?', 'Wie sah ein ganz normaler Schultag bei dir aus?'],
  ['Which invention changed your everyday life the most?', 'Welche Erfindung hat deinen Alltag am meisten verändert?'],
  ['What were you really good at as a child?', 'Worin warst du als Kind richtig gut?'],
  ['Which journey or move changed your life?', 'Welche Reise oder welcher Umzug hat dein Leben verändert?'],
  ['What would you like the others in this family to know about you?', 'Was sollen die anderen in dieser Familie über dich wissen?'],
  ['Which smell takes you back to a family moment?', 'Welcher Geruch bringt dich zurück zu einem Familienmoment?'],
  ['What did you dream about when you were twenty?', 'Wovon hast du mit zwanzig geträumt?'],
];

const pad = (n: number) => String(n).padStart(2, '0');
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Monday of the week, YYYY-MM-DD. */
export function weekKey(d = new Date()): string {
  const m = new Date(d);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return dayKey(m);
}

// Days since 1 Jan 2026 (local), so the list runs in order without repeats for weeks.
const dayNumber = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(2026, 0, 1)) / 86_400_000);
};
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Today's question (the same for everyone on that day). */
export function questionOfDay(day = dayKey()): string {
  const [en, de] = DAILY[mod(dayNumber(day), DAILY.length)];
  return tr(en, de);
}

/** The family question for the week starting on that Monday. */
export function familyQuestion(week = weekKey()): string {
  const [en, de] = FAMILY[mod(Math.floor(dayNumber(week) / 7), FAMILY.length)];
  return tr(en, de);
}

export const dailyMemoryId = (day = dayKey()) => `dq-${day}`;
