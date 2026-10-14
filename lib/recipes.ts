// "Omas Kochbuch" (Marco, 2026-10-14: "Leckereien von Damals als Rezepte!"):
// treats from every decade of the journey, two per decade, written in our own
// words (no recipe site copied). Each text exists in English and German; the
// English ones use US measures, with grams where baking needs them exact.

import { tr } from './i18n';

type Text = { en: string; de: string };
type List = { en: string[]; de: string[] };

export interface Recipe {
  id: string;
  /** Key of DECADES_DB: '1960' … '2010'. */
  decade: string;
  icon: string;
  title: Text;
  /** Grandma's little story about it. */
  story: Text;
  serves: Text;
  time: Text;
  ingredients: List;
  steps: List;
  tip: Text;
  /** The question for the memory book when someone remembers it. */
  question: Text;
}

export const RECIPES: Recipe[] = [
  // --- 1960s -------------------------------------------------------------
  {
    id: 'toast-hawaii',
    decade: '1960',
    icon: '🍍',
    title: { en: 'Hawaiian Toast', de: 'Toast Hawaii' },
    story: {
      en: 'Pineapple from a can on a Sunday evening: that was the big wide world on a plate. Grandma served it with a cherry on top, and everyone felt very modern.',
      de: 'Ananas aus der Dose am Sonntagabend: Das war die große weite Welt auf dem Teller. Oma servierte ihn mit Kirsche obendrauf, und alle fühlten sich sehr modern.',
    },
    serves: { en: '4 slices', de: '4 Scheiben' },
    time: { en: '20 minutes', de: '20 Minuten' },
    ingredients: {
      en: ['4 slices white sandwich bread', '1 tbsp soft butter', '4 slices cooked ham', '4 canned pineapple rings, well drained', '4 slices Gouda or Swiss cheese', '4 maraschino cherries', 'a pinch of paprika'],
      de: ['4 Scheiben Toastbrot', '1 EL weiche Butter', '4 Scheiben gekochter Schinken', '4 Ananasringe aus der Dose, gut abgetropft', '4 Scheiben Gouda oder Emmentaler', '4 Cocktailkirschen', '1 Prise Paprikapulver'],
    },
    steps: {
      en: ['Heat the oven to 400 °F (200 °C).', 'Butter the bread thinly and lay it on a baking sheet.', 'Top each slice with ham, a pineapple ring and a slice of cheese.', 'Bake for about 10 minutes, until the cheese melts and bubbles.', 'Put a cherry in the middle of each ring, dust with paprika and serve hot.'],
      de: ['Den Ofen auf 200 °C Ober-/Unterhitze vorheizen.', 'Das Toastbrot dünn mit Butter bestreichen und aufs Blech legen.', 'Jede Scheibe mit Schinken, einem Ananasring und einer Scheibe Käse belegen.', 'Etwa 10 Minuten backen, bis der Käse zerläuft und Blasen wirft.', 'Eine Kirsche in die Mitte jedes Rings setzen, mit Paprika bestäuben und heiß servieren.'],
    },
    tip: {
      en: 'Pat the pineapple dry with a kitchen towel, or the toast goes soggy.',
      de: 'Die Ananas mit Küchenpapier trockentupfen, sonst weicht der Toast durch.',
    },
    question: {
      en: 'Who made Hawaiian toast at your house, and what was the occasion?',
      de: 'Wer hat bei euch Toast Hawaii gemacht, und zu welchem Anlass?',
    },
  },
  {
    id: 'kalter-hund',
    decade: '1960',
    icon: '🍫',
    title: { en: 'Chocolate Biscuit Cake (“Cold Dog”)', de: 'Kalter Hund' },
    story: {
      en: 'No oven needed, just a loaf pan and the fridge. In Germany it is called “Kalter Hund”, cold dog, and no child’s birthday went without it. Every slice shows neat stripes of cookie and chocolate.',
      de: 'Ganz ohne Ofen, nur eine Kastenform und der Kühlschrank. Kein Kindergeburtstag kam ohne ihn aus, und jede Scheibe zeigt ordentliche Streifen aus Keks und Schokolade.',
    },
    serves: { en: '1 loaf pan (about 12 slices)', de: '1 Kastenform (etwa 12 Scheiben)' },
    time: { en: '30 minutes + 4 hours chilling', de: '30 Minuten + 4 Stunden Kühlzeit' },
    ingredients: {
      en: ['1 cup + 2 tbsp (250 g) solid coconut oil', '¾ cup (100 g) powdered sugar', '½ cup (50 g) unsweetened cocoa powder', '1 tsp vanilla extract', '2 tbsp milk', 'a pinch of salt', 'about 30 plain rectangular butter cookies'],
      de: ['250 g Kokosfett', '100 g Puderzucker', '50 g Kakaopulver (ungesüßt)', '1 Päckchen Vanillezucker', '2 EL Milch', '1 Prise Salz', 'etwa 30 Butterkekse'],
    },
    steps: {
      en: ['Line a 9 × 5 inch loaf pan with parchment paper.', 'Melt the coconut oil gently and let it cool until just lukewarm.', 'Sift in the sugar and cocoa, add vanilla, milk and salt and stir until smooth and glossy.', 'Spread a thin layer of chocolate in the pan, then a layer of cookies. Repeat until everything is used, ending with chocolate.', 'Chill for at least 4 hours, better overnight. Lift out and slice with a knife dipped in hot water.'],
      de: ['Eine Kastenform (etwa 25 cm) mit Backpapier auslegen.', 'Das Kokosfett langsam schmelzen und abkühlen lassen, bis es nur noch lauwarm ist.', 'Puderzucker und Kakao hineinsieben, Vanillezucker, Milch und Salz dazugeben und glatt und glänzend rühren.', 'Eine dünne Schicht Schokolade in die Form streichen, dann eine Lage Kekse. So weiter schichten, bis alles verbraucht ist; zum Schluss Schokolade.', 'Mindestens 4 Stunden kühlen, besser über Nacht. Herausheben und mit einem in heißes Wasser getauchten Messer schneiden.'],
    },
    tip: {
      en: 'Grandma’s original used raw eggs. This one doesn’t, so the little ones can have a slice too.',
      de: 'Omas Original kam mit rohen Eiern. Dieses hier nicht, damit auch die Kleinen ein Stück bekommen dürfen.',
    },
    question: {
      en: 'At which birthday party do you remember a chocolate biscuit cake?',
      de: 'An welchen Geburtstag mit Kaltem Hund erinnerst du dich?',
    },
  },

  // --- 1970s -------------------------------------------------------------
  {
    id: 'goetterspeise',
    decade: '1970',
    icon: '🟢',
    title: { en: 'Green Jello with Vanilla Sauce', de: 'Götterspeise mit Vanillesoße' },
    story: {
      en: 'Wobbly, bright green and served in glass bowls: dessert on a Sunday. The best moment was when the cold vanilla sauce ran down the sides.',
      de: 'Wackelig, knallgrün und in Glasschälchen serviert: der Nachtisch am Sonntag. Der schönste Moment war, wenn die kalte Vanillesoße an den Seiten herunterlief.',
    },
    serves: { en: '4 bowls', de: '4 Schälchen' },
    time: { en: '20 minutes + 3 hours setting', de: '20 Minuten + 3 Stunden Kühlzeit' },
    ingredients: {
      en: ['1 box (3 oz) lime gelatin dessert', '1 cup boiling water', '1 cup cold water', '1 box (3.4 oz) instant vanilla pudding', '3 cups cold milk'],
      de: ['1 Päckchen Götterspeise Waldmeister', 'Zucker und Wasser laut Packung (meist 100 g und 500 ml)', '1 Päckchen Vanillesoßenpulver', '500 ml Milch', '2 EL Zucker'],
    },
    steps: {
      en: ['Stir the gelatin powder into the boiling water until fully dissolved, then add the cold water.', 'Pour into four glass bowls and chill for about 3 hours, until set.', 'For the sauce, whisk the pudding mix into the milk for 2 minutes. With one cup more milk than the box asks for, it stays a pourable sauce.', 'Chill the sauce and pour it over the jello just before serving.'],
      de: ['Die Götterspeise nach Packung mit Wasser und Zucker zubereiten; sie darf heiß werden, aber nicht kochen.', 'In vier Glasschälchen füllen und etwa 3 Stunden kühlen, bis sie fest ist.', 'Für die Soße das Pulver mit dem Zucker und 6 EL Milch glatt rühren. Die übrige Milch aufkochen, das Angerührte einrühren und kurz aufkochen lassen.', 'Die Soße abkühlen lassen und ab und zu umrühren, damit sich keine Haut bildet. Kurz vor dem Servieren über die Götterspeise gießen.'],
    },
    tip: {
      en: 'Hold the bowl and tap the table: if it wobbles, it’s right.',
      de: 'Schälchen festhalten und auf den Tisch klopfen: Wenn sie wackelt, ist sie richtig.',
    },
    question: {
      en: 'Green, red or yellow: which jello was yours, and who made it?',
      de: 'Grün, rot oder gelb: Welche Götterspeise war deine, und wer hat sie gemacht?',
    },
  },
  {
    id: 'kaese-igel',
    decade: '1970',
    icon: '🦔',
    title: { en: 'Cheese Hedgehog', de: 'Käseigel' },
    story: {
      en: 'The star of every party buffet: half a melon bristling with toothpicks of cheese, grapes and pickles. By the end of the evening the hedgehog was always bald.',
      de: 'Der Star auf jedem Partybuffet: eine halbe Melone voller Spieße mit Käse, Trauben und Gürkchen. Am Ende des Abends war der Igel immer kahl.',
    },
    serves: { en: '1 party platter', de: '1 Partyplatte' },
    time: { en: '30 minutes', de: '30 Minuten' },
    ingredients: {
      en: ['½ honeydew melon (or ½ grapefruit wrapped in foil)', '10 oz Gouda in one piece', '2 cups grapes, green and red', '1 small jar pickled pearl onions', '1 small jar cornichons', '1 black olive and 2 whole cloves for the face', 'toothpicks'],
      de: ['½ Honigmelone (oder eine halbe Grapefruit in Alufolie)', '300 g Gouda am Stück', '250 g Weintrauben, hell und dunkel', '1 kleines Glas Silberzwiebeln', '1 kleines Glas Cornichons', '1 schwarze Olive und 2 Gewürznelken für das Gesicht', 'Zahnstocher'],
    },
    steps: {
      en: ['Lay the melon cut side down on a platter. That is the hedgehog’s body.', 'Cut the cheese into bite-sized cubes.', 'Spear one cheese cube with a grape, an onion or a cornichon on each toothpick.', 'Stick the toothpicks into the melon close together, like spines, leaving the narrow end free.', 'Press in the olive as a nose and the two cloves as eyes.'],
      de: ['Die Melone mit der Schnittfläche nach unten auf eine Platte legen. Das ist der Körper des Igels.', 'Den Käse in mundgerechte Würfel schneiden.', 'Auf jeden Zahnstocher einen Käsewürfel mit einer Traube, einer Silberzwiebel oder einem Gürkchen stecken.', 'Die Spieße dicht an dicht wie Stacheln in die Melone stecken; das schmale Ende frei lassen.', 'Die Olive als Nase und die zwei Nelken als Augen hineindrücken.'],
    },
    tip: {
      en: 'Build it no earlier than an hour before the guests come, so the cheese doesn’t sweat.',
      de: 'Erst eine Stunde vor den Gästen bauen, sonst schwitzt der Käse.',
    },
    question: {
      en: 'Which party with a cheese hedgehog do you still remember?',
      de: 'An welche Party mit Käseigel erinnerst du dich noch?',
    },
  },

  // --- 1980s -------------------------------------------------------------
  {
    id: 'spaghetti-eis',
    decade: '1980',
    icon: '🍝',
    title: { en: 'Spaghetti Ice Cream', de: 'Spaghetti-Eis' },
    story: {
      en: 'It looked like pasta with tomato sauce and parmesan, but it was ice cream! Invented at an ice cream parlor in Mannheim, Germany, in 1969, it was the order of the summer in the eighties.',
      de: 'Sah aus wie Nudeln mit Tomatensoße und Parmesan, war aber Eis! Erfunden 1969 in einer Mannheimer Eisdiele, war es in den Achtzigern die Bestellung des Sommers.',
    },
    serves: { en: '2 sundaes', de: '2 Becher' },
    time: { en: '15 minutes', de: '15 Minuten' },
    ingredients: {
      en: ['1 pint vanilla ice cream', '1½ cups strawberries (fresh or frozen, thawed)', '1–2 tbsp powdered sugar', '½ cup heavy cream', '2 oz white chocolate'],
      de: ['500 ml Vanilleeis', '250 g Erdbeeren (frisch oder aufgetaut)', '1–2 EL Puderzucker', '100 g Sahne', '50 g weiße Schokolade'],
    },
    steps: {
      en: ['Put a potato ricer in the freezer for 15 minutes.', 'Whip the cream and spread it on two plates as a bed.', 'Purée the strawberries with the powdered sugar.', 'Let the ice cream soften for a few minutes, then press it through the cold ricer onto the cream as “spaghetti”.', 'Spoon the strawberry sauce over it and grate the white chocolate on top like parmesan.'],
      de: ['Eine Spätzle- oder Kartoffelpresse 15 Minuten ins Gefrierfach legen.', 'Die Sahne steif schlagen und als Bett auf zwei Teller streichen.', 'Die Erdbeeren mit dem Puderzucker pürieren.', 'Das Eis ein paar Minuten antauen lassen und durch die kalte Presse als „Spaghetti“ auf die Sahne drücken.', 'Die Erdbeersoße darübergeben und die weiße Schokolade wie Parmesan darüberreiben.'],
    },
    tip: {
      en: 'Work quickly and press it straight onto the plate. Ice cream spaghetti don’t like waiting.',
      de: 'Zügig arbeiten und direkt auf den Teller drücken. Eisspaghetti warten nicht gern.',
    },
    question: {
      en: 'Which ice cream parlor did you go to, and what did you always order?',
      de: 'In welche Eisdiele bist du gegangen, und was hast du immer bestellt?',
    },
  },
  {
    id: 'schokokuss-broetchen',
    decade: '1980',
    icon: '🥯',
    title: { en: 'Chocolate Marshmallow Roll', de: 'Schokokuss-Brötchen' },
    story: {
      en: 'The schoolyard classic in Germany: a soft roll with a chocolate-covered marshmallow squashed inside. Whoever had one at recess was the hero of the day.',
      de: 'Der Pausenhof-Klassiker: ein weiches Brötchen, in das ein Schokokuss gequetscht wurde. Wer eins in der großen Pause hatte, war der Held des Tages.',
    },
    serves: { en: '4 rolls', de: '4 Brötchen' },
    time: { en: '5 minutes', de: '5 Minuten' },
    ingredients: {
      en: ['4 soft rolls (milk rolls or brioche buns)', '4 chocolate-covered marshmallow treats'],
      de: ['4 weiche Brötchen (Milch- oder Weizenbrötchen)', '4 Schokoküsse'],
    },
    steps: {
      en: ['Cut the rolls open, but not all the way through.', 'Put one marshmallow treat inside each, wafer side down.', 'Close the roll and press it flat with your hand until the chocolate cracks and the foam comes out the sides.', 'Eat right away, ideally in front of the others.'],
      de: ['Die Brötchen aufschneiden, aber nicht ganz durch.', 'In jedes einen Schokokuss setzen, mit der Waffel nach unten.', 'Das Brötchen zuklappen und mit der Hand flach drücken, bis die Schokolade knackt und der Schaum an den Seiten herausquillt.', 'Sofort essen, am besten vor allen anderen.'],
    },
    tip: {
      en: 'Napkins! Lots of napkins.',
      de: 'Servietten! Viele Servietten.',
    },
    question: {
      en: 'What was the best thing in your lunchbox, and who packed it?',
      de: 'Was war das Beste in deiner Brotdose, und wer hat sie gepackt?',
    },
  },

  // --- 1990s -------------------------------------------------------------
  {
    id: 'zupfkuchen',
    decade: '1990',
    icon: '🍰',
    title: { en: 'Chocolate Cheesecake Crumble (“Russian Pluck Cake”)', de: 'Russischer Zupfkuchen' },
    story: {
      en: 'Dark chocolate dough, a creamy cheesecake filling and little plucked pieces of dough on top. In the nineties it suddenly stood on every coffee table in Germany. Despite the name, it doesn’t come from Russia.',
      de: 'Dunkler Schokoteig, cremige Quarkfüllung und obendrauf gezupfte Teigstückchen. In den Neunzigern stand er plötzlich auf jeder Kaffeetafel. Trotz des Namens kommt er nicht aus Russland.',
    },
    serves: { en: '1 springform pan (12 pieces)', de: '1 Springform (12 Stücke)' },
    time: { en: '30 minutes + 1 hour baking', de: '30 Minuten + 1 Stunde Backzeit' },
    ingredients: {
      en: [
        'Dough: 2⅓ cups (300 g) flour, 2 tsp baking powder, ⅓ cup (40 g) cocoa powder, 1 cup (200 g) sugar, 1 egg, ¾ cup + 2 tbsp (200 g) soft butter',
        'Filling: 1 lb (500 g) quark or farmer’s cheese, 1 cup (200 g) sugar, 1 box (3.4 oz) vanilla pudding mix (cook-and-serve), 3 eggs, 1 cup + 2 tbsp (250 g) melted butter, 1 tsp vanilla extract',
      ],
      de: [
        'Teig: 300 g Mehl, 2 TL Backpulver, 40 g Kakaopulver, 200 g Zucker, 1 Ei, 200 g weiche Butter',
        'Füllung: 500 g Magerquark, 200 g Zucker, 1 Päckchen Vanillepuddingpulver, 3 Eier, 250 g geschmolzene Butter, 1 Päckchen Vanillezucker',
      ],
    },
    steps: {
      en: ['Heat the oven to 350 °F (175 °C) and grease a 10-inch springform pan.', 'Knead all the dough ingredients into a smooth dough.', 'Press two thirds of it into the pan, with a rim about 1 inch high.', 'Stir all the filling ingredients until smooth and pour into the pan.', 'Pluck the rest of the dough into small pieces and scatter them on top.', 'Bake for 60 to 70 minutes. Let it cool completely in the pan.'],
      de: ['Den Ofen auf 175 °C Ober-/Unterhitze vorheizen und eine Springform (26 cm) fetten.', 'Alle Teigzutaten zu einem glatten Teig verkneten.', 'Zwei Drittel davon in die Form drücken, mit einem etwa 3 cm hohen Rand.', 'Alle Zutaten für die Füllung glatt rühren und in die Form gießen.', 'Den übrigen Teig in kleine Stücke zupfen und auf der Füllung verteilen.', '60 bis 70 Minuten backen. In der Form vollständig auskühlen lassen.'],
    },
    tip: {
      en: 'Tastes even better on the second day, if any is left.',
      de: 'Am zweiten Tag schmeckt er noch besser, falls etwas übrig bleibt.',
    },
    question: {
      en: 'Whose coffee table had the best cake in the nineties?',
      de: 'Auf wessen Kaffeetafel stand in den Neunzigern der beste Kuchen?',
    },
  },
  {
    id: 'pizzabroetchen',
    decade: '1990',
    icon: '🍕',
    title: { en: 'Pizza Rolls', de: 'Pizzabrötchen' },
    story: {
      en: 'For game nights, sleepovers and the first parties without grown-ups: rolls from yesterday, spread thick with a creamy topping and baked until golden.',
      de: 'Für Spieleabende, Übernachtungspartys und die ersten Feten ohne Erwachsene: Brötchen vom Vortag, dick bestrichen und goldbraun überbacken.',
    },
    serves: { en: '12 halves', de: '12 Hälften' },
    time: { en: '30 minutes', de: '30 Minuten' },
    ingredients: {
      en: ['6 crusty rolls from yesterday', '5 oz cooked ham or salami, diced', '1 small onion, finely diced', '1 bell pepper, diced', '½ cup sliced mushrooms', '⅔ cup sour cream', '1½ cups shredded cheese', 'salt, pepper, dried oregano'],
      de: ['6 Brötchen vom Vortag', '150 g Kochschinken oder Salami, gewürfelt', '1 kleine Zwiebel, fein gewürfelt', '1 Paprikaschote, gewürfelt', '100 g Champignons in Scheiben', '150 g Schmand oder Crème fraîche', '150 g geriebener Käse', 'Salz, Pfeffer, Oregano'],
    },
    steps: {
      en: ['Heat the oven to 400 °F (200 °C).', 'Halve the rolls and lay them cut side up on a baking sheet.', 'Mix all the other ingredients in a bowl and season well.', 'Spread the mix thickly on the rolls.', 'Bake for 12 to 15 minutes, until the cheese is golden.'],
      de: ['Den Ofen auf 200 °C Ober-/Unterhitze vorheizen.', 'Die Brötchen halbieren und mit der Schnittfläche nach oben aufs Blech legen.', 'Alle übrigen Zutaten in einer Schüssel mischen und kräftig würzen.', 'Die Masse dick auf die Brötchen streichen.', '12 bis 15 Minuten backen, bis der Käse goldbraun ist.'],
    },
    tip: {
      en: 'Whatever is in the fridge can go in. Pizza rolls are a leftovers recipe.',
      de: 'Was der Kühlschrank hergibt, darf mit hinein. Pizzabrötchen sind ein Resteessen.',
    },
    question: {
      en: 'Which sleepover or party with pizza rolls do you remember?',
      de: 'An welche Übernachtungsparty oder Fete mit Pizzabrötchen erinnerst du dich?',
    },
  },

  // --- 2000s -------------------------------------------------------------
  {
    id: 'schoko-muffins',
    decade: '2000',
    icon: '🧁',
    title: { en: 'Chocolate Chip Muffins', de: 'Schoko-Muffins' },
    story: {
      en: 'Suddenly there were paper cups and muffin tins in every kitchen. Quickly stirred, quickly baked, and perfect for school bake sales.',
      de: 'Plötzlich gab es in jeder Küche Papierförmchen und ein Muffinblech. Schnell gerührt, schnell gebacken und perfekt für den Kuchenverkauf in der Schule.',
    },
    serves: { en: '12 muffins', de: '12 Muffins' },
    time: { en: '15 minutes + 22 minutes baking', de: '15 Minuten + 22 Minuten Backzeit' },
    ingredients: {
      en: ['2 cups (250 g) flour', '¼ cup (30 g) cocoa powder', '2 tsp baking powder', '½ tsp baking soda', '⅔ cup (130 g) sugar', 'a pinch of salt', '1 egg', '⅓ cup (80 ml) vegetable oil', '1 cup (250 ml) buttermilk', '⅔ cup (100 g) chocolate chips'],
      de: ['250 g Mehl', '30 g Kakaopulver', '2 TL Backpulver', '½ TL Natron', '130 g Zucker', '1 Prise Salz', '1 Ei', '80 ml Öl', '250 ml Buttermilch', '100 g Schokotropfen'],
    },
    steps: {
      en: ['Heat the oven to 350 °F (180 °C) and line a muffin tin with paper cups.', 'Mix flour, cocoa, baking powder, baking soda, sugar and salt in one bowl.', 'Whisk egg, oil and buttermilk in a second bowl.', 'Pour the wet into the dry and stir only briefly, until everything is just moist. Fold in the chocolate chips.', 'Fill the cups about two thirds full and bake for 20 to 25 minutes.'],
      de: ['Den Ofen auf 180 °C Ober-/Unterhitze vorheizen und ein Muffinblech mit Papierförmchen auslegen.', 'Mehl, Kakao, Backpulver, Natron, Zucker und Salz in einer Schüssel mischen.', 'Ei, Öl und Buttermilch in einer zweiten Schüssel verquirlen.', 'Das Flüssige zum Trockenen geben und nur kurz verrühren, bis alles feucht ist. Die Schokotropfen unterheben.', 'Die Förmchen zu zwei Dritteln füllen und 20 bis 25 Minuten backen.'],
    },
    tip: {
      en: 'Stir as little as possible! The lumps make them fluffy.',
      de: 'So wenig wie möglich rühren! Die Klümpchen machen sie locker.',
    },
    question: {
      en: 'What did you bake in the 2000s, and for whom?',
      de: 'Was hast du in den Nullerjahren gebacken, und für wen?',
    },
  },
  {
    id: 'smoothie',
    decade: '2000',
    icon: '🥤',
    title: { en: 'Strawberry Banana Smoothie', de: 'Erdbeer-Bananen-Smoothie' },
    story: {
      en: 'Juice bars opened everywhere, and everyone suddenly owned a blender. Fruit through a straw felt healthy and a little bit like vacation.',
      de: 'Überall eröffneten Saftbars, und plötzlich hatte jeder einen Mixer. Obst durch den Strohhalm fühlte sich gesund an und ein bisschen nach Urlaub.',
    },
    serves: { en: '2 glasses', de: '2 Gläser' },
    time: { en: '5 minutes', de: '5 Minuten' },
    ingredients: {
      en: ['1 ripe banana', '1 cup strawberries', '⅔ cup plain yogurt', '⅔ cup orange juice or milk', '1 tsp honey, if you like'],
      de: ['1 reife Banane', '150 g Erdbeeren', '150 g Naturjoghurt', '150 ml Orangensaft oder Milch', '1 TL Honig nach Geschmack'],
    },
    steps: {
      en: ['Peel the banana and break it into pieces. Hull the strawberries.', 'Put everything in the blender.', 'Blend for about 30 seconds, until smooth.', 'Pour into two tall glasses and serve with a straw.'],
      de: ['Die Banane schälen und in Stücke brechen. Die Erdbeeren putzen.', 'Alles in den Mixer geben.', 'Etwa 30 Sekunden mixen, bis alles cremig ist.', 'In zwei hohe Gläser füllen und mit Strohhalm servieren.'],
    },
    tip: {
      en: 'With frozen strawberries it turns into a cold, thick shake.',
      de: 'Mit gefrorenen Erdbeeren wird daraus ein kalter, dicker Shake.',
    },
    question: {
      en: 'Which drink was your 2000s favorite, and where did you get it?',
      de: 'Welches Getränk war dein Favorit in den Nullerjahren, und wo gab es das?',
    },
  },

  // --- 2010s -------------------------------------------------------------
  {
    id: 'cake-pops',
    decade: '2010',
    icon: '🍭',
    title: { en: 'Cake Pops', de: 'Cake Pops' },
    story: {
      en: 'Cake on a stick, dipped in chocolate and covered in sprinkles: they were on every blog and every party table, and every photo of them went online.',
      de: 'Kuchen am Stiel, in Schokolade getaucht und voller Streusel: Sie waren auf jedem Blog und jedem Partytisch, und jedes Foto davon landete im Netz.',
    },
    serves: { en: 'about 20 pops', de: 'etwa 20 Stück' },
    time: { en: '45 minutes + 30 minutes chilling', de: '45 Minuten + 30 Minuten Kühlzeit' },
    ingredients: {
      en: ['10 oz pound cake (yesterday’s is fine)', '3½ oz (100 g) cream cheese', '⅓ cup powdered sugar', '7 oz (200 g) chocolate or candy melts', 'colorful sprinkles', '20 lollipop sticks', 'a block of styrofoam or a glass full of sugar to stand them in'],
      de: ['300 g fertiger Rührkuchen (gern vom Vortag)', '100 g Frischkäse', '50 g Puderzucker', '200 g Kuvertüre', 'bunte Streusel', '20 Cake-Pop-Stiele', 'ein Styroporblock oder ein Glas voll Zucker zum Hineinstecken'],
    },
    steps: {
      en: ['Crumble the cake very finely and knead it with the cream cheese and powdered sugar.', 'Roll walnut-sized balls and chill them for 30 minutes.', 'Melt the chocolate. Dip the tip of each stick in it and push it halfway into a ball. Chill for 10 minutes.', 'Dip each pop completely, let the extra drip off and scatter sprinkles over it.', 'Stand them upright to dry.'],
      de: ['Den Kuchen sehr fein zerbröseln und mit Frischkäse und Puderzucker verkneten.', 'Walnussgroße Kugeln rollen und 30 Minuten kühlen.', 'Die Kuvertüre schmelzen. Die Spitze jedes Stiels eintauchen und halb in eine Kugel stecken. 10 Minuten kühlen.', 'Jede Kugel ganz eintauchen, gut abtropfen lassen und mit Streuseln bestreuen.', 'Aufrecht stehend trocknen lassen.'],
    },
    tip: {
      en: 'Cold balls in warm chocolate: then nothing falls off the stick.',
      de: 'Kalte Kugeln in warme Schokolade: Dann fällt nichts vom Stiel.',
    },
    question: {
      en: 'Which party or trend of the 2010s do you remember best?',
      de: 'An welche Party oder welchen Trend der 2010er erinnerst du dich am liebsten?',
    },
  },
  {
    id: 'avocado-toast',
    decade: '2010',
    icon: '🥑',
    title: { en: 'Avocado Toast', de: 'Avocado-Toast' },
    story: {
      en: 'The breakfast that started a whole debate between the generations. Grandma shook her head at first, and then ate it every Sunday.',
      de: 'Das Frühstück, über das eine ganze Generationsdebatte geführt wurde. Oma hat erst den Kopf geschüttelt und es dann jeden Sonntag gegessen.',
    },
    serves: { en: '2 slices', de: '2 Scheiben' },
    time: { en: '10 minutes', de: '10 Minuten' },
    ingredients: {
      en: ['2 slices sourdough bread', '1 ripe avocado', 'juice of ½ lemon', 'salt and pepper', 'chili flakes', '2 eggs, fried or poached, if you like', 'a handful of cress or sprouts'],
      de: ['2 Scheiben Sauerteigbrot', '1 reife Avocado', 'Saft einer halben Zitrone', 'Salz und Pfeffer', 'Chiliflocken', '2 Eier, als Spiegel- oder pochiertes Ei, nach Geschmack', '1 Handvoll Kresse'],
    },
    steps: {
      en: ['Toast the bread until crisp.', 'Halve the avocado, remove the pit and scoop out the flesh.', 'Mash it roughly with a fork and season with lemon juice, salt and pepper.', 'Spread it thickly on the toast.', 'Top with an egg if you like, chili flakes and cress.'],
      de: ['Das Brot knusprig rösten.', 'Die Avocado halbieren, den Kern entfernen und das Fruchtfleisch herauslöffeln.', 'Mit einer Gabel grob zerdrücken und mit Zitronensaft, Salz und Pfeffer abschmecken.', 'Dick auf das Brot streichen.', 'Nach Geschmack mit einem Ei, Chiliflocken und Kresse belegen.'],
    },
    tip: {
      en: 'Don’t mash it too fine. A few chunks belong in it.',
      de: 'Nicht zu fein zerdrücken. Ein paar Stückchen gehören dazu.',
    },
    question: {
      en: 'What was your go-to breakfast in the 2010s?',
      de: 'Was war dein liebstes Frühstück in den 2010ern?',
    },
  },
];

/** Picks the English or German variant of a recipe text. */
export function t<T>(v: { en: T; de: T }): T {
  return tr(v.en, v.de);
}

/** The decades that have recipes, the visitor's own first, then in order. */
export function recipeDecades(focusDecade: string): string[] {
  const all = [...new Set(RECIPES.map((r) => r.decade))].sort();
  return all.sort((a, b) => (a === focusDecade ? -1 : b === focusDecade ? 1 : a.localeCompare(b)));
}
