// "Damals & heute" (Marco, 2026-10-19: "Begriffserklärung, damit man auf
// einen Blick sieht, was es für Begriffe damals gab und welche es heute
// gibt, gerne mit Beispielsatz"): a small dictionary in Erkunden. Each entry
// pairs a word or thing from back then with what it is today, a one-line
// note, and a sentence as you would have said it then and as you say it now.
//
// The two languages are separate lists, not translations: an American kid
// in the 80s said "totally rad" and put a bike on layaway, a German one said
// "geil" and paid with a Euroscheck. `decade` is when the old word was in
// everyday use (a key of DECADES_DB).

import { isGerman } from './i18n';

export type GlossaryTopic = 'tech' | 'talk' | 'everyday' | 'money' | 'media' | 'games';

export interface GlossaryEntry {
  id: string;
  decade: string;
  topic: GlossaryTopic;
  /** The word or thing from back then. */
  then: string;
  /** What it is (or what you say) today. */
  now: string;
  /** One line on what it was, or what changed. */
  note: string;
  /** A sentence as you would have said it back then. */
  sayThen: string;
  /** The same moment today. */
  sayNow: string;
}

const DE: GlossaryEntry[] = [
  // --- 1960er ---------------------------------------------------------------
  { id: 'de-wahlscheibe', decade: '1960', topic: 'tech', then: 'Wählscheiben\u00adtelefon', now: 'Smartphone', note: 'Der Apparat hing mit Schnur im Flur, jede Ziffer wurde mit dem Finger gedreht. Heute steckt das Telefon in der Hosentasche.', sayThen: 'Sei mal leise, ich wähle gerade, sonst verwähl ich mich wieder.', sayNow: 'Ich schick dir kurz eine Sprachnachricht.' },
  { id: 'de-telegramm', decade: '1960', topic: 'tech', then: 'Telegramm', now: 'Kurznachricht', note: 'Jedes Wort kostete Geld, deshalb schrieb man so knapp wie möglich und „STOP“ statt Punkt.', sayThen: 'Schick ein Telegramm: ANKOMME DIENSTAG STOP BITTE ABHOLEN STOP.', sayNow: 'Schreib einfach in die Familiengruppe, wann du ankommst.' },
  { id: 'de-groschen', decade: '1960', topic: 'money', then: 'Groschen', now: 'Kleingeld (das keiner mehr braucht)', note: 'Ein Groschen waren zehn Pfennig. Damit telefonierte man, kaufte Brausepulver oder fütterte den Kaugummiautomaten.', sayThen: 'Hast du mal einen Groschen für die Telefonzelle?', sayNow: 'Der Automat nimmt nur noch Karte, Kleingeld braucht keiner mehr.' },
  { id: 'de-tante-emma', decade: '1960', topic: 'everyday', then: 'Tante-Emma-Laden', now: 'Supermarkt oder Liefer-App', note: 'Der kleine Laden an der Ecke, in dem man alles bekam und notfalls „anschreiben“ ließ.', sayThen: 'Lauf mal schnell zu Tante Emma und hol ein Pfund Butter, wir lassen anschreiben.', sayNow: 'Ich bestell die Butter per App, in zehn Minuten ist sie da.' },
  { id: 'de-fraeulein', decade: '1960', topic: 'everyday', then: 'Fräulein', now: 'Frau', note: 'So sprach man unverheiratete Frauen an, auch die Kellnerin. Seit den 70ern verschwand das Wort langsam.', sayThen: 'Fräulein, zahlen bitte!', sayNow: 'Entschuldigung, können wir bitte zahlen?' },
  { id: 'de-testbild', decade: '1960', topic: 'media', then: 'Sendeschluss und Testbild', now: 'Streaming rund um die Uhr', note: 'Nachts war das Fernsehen einfach zu Ende: Nationalhymne, dann Testbild und Rauschen.', sayThen: 'Ab ins Bett, gleich kommt sowieso das Testbild.', sayNow: 'Nur noch eine Folge, dann mach ich aus.' },
  { id: 'de-dufte', decade: '1960', topic: 'talk', then: 'dufte', now: 'nice', note: 'Das höchste Lob der Halbstarken: dufte war alles, was richtig gut war.', sayThen: 'Die neue Platte ist echt dufte!', sayNow: 'Der neue Song ist voll nice.' },
  { id: 'de-backfisch', decade: '1960', topic: 'talk', then: 'Backfisch', now: 'Teenie', note: 'So nannte man Mädchen zwischen Kind und junger Frau, etwa von 14 bis 17.', sayThen: 'Mit fünfzehn war sie ein richtiger Backfisch.', sayNow: 'Sie ist halt gerade voll im Teenie-Alter.' },

  // --- 1970er ---------------------------------------------------------------
  { id: 'de-mixtape', decade: '1970', topic: 'media', then: 'Mixkassette', now: 'Playlist', note: 'Lieder einzeln vom Radio oder von Platten aufnehmen, Hülle selbst beschriften: die Liebeserklärung jener Jahre.', sayThen: 'Ich hab dir eine Kassette aufgenommen, die B-Seite ist nur für dich.', sayNow: 'Ich hab dir eine Playlist geteilt.' },
  { id: 'de-bandsalat', decade: '1970', topic: 'tech', then: 'Bandsalat', now: 'Ladekreis', note: 'Wenn der Rekorder das Band fraß, half nur ein Bleistift zum Zurückdrehen. Heute dreht sich stattdessen der Kreis.', sayThen: 'Mist, Bandsalat! Gib mal schnell einen Bleistift.', sayNow: 'Das Video hängt, ich seh nur den Ladekreis.' },
  { id: 'de-fete', decade: '1970', topic: 'everyday', then: 'Fete', now: 'Party', note: 'Im Partykeller mit Salzstangen, Bowle und Plattenspieler.', sayThen: 'Am Samstag steigt bei mir eine Fete, bring Platten mit!', sayNow: 'Samstag ist Party bei mir, ich schick dir den Standort.' },
  { id: 'de-pauker', decade: '1970', topic: 'talk', then: 'Pauker und Penne', now: 'Lehrer und Schule', note: 'Schülersprache: Die Schule hieß Penne, der Lehrer Pauker.', sayThen: 'Morgen geht’s wieder in die Penne, und der Pauker lässt eine Arbeit schreiben.', sayNow: 'Morgen ist Schule, und wir schreiben eine Klassenarbeit.' },
  { id: 'de-spitze', decade: '1970', topic: 'talk', then: 'Spitze!', now: 'Mega!', note: 'Spätestens seit „Dalli Dalli“ sagte ganz Deutschland: Das war Spitze!', sayThen: 'Sie sind der Meinung: Das war Spitze!', sayNow: 'Das war mega!' },
  { id: 'de-diaabend', decade: '1970', topic: 'media', then: 'Diaabend', now: 'Fotos in der Story', note: 'Leinwand aufbauen, Projektor surren lassen, und die ganze Verwandtschaft sah 200 Bilder vom Gardasee.', sayThen: 'Am Sonntag gibt’s Diaabend vom Italienurlaub, Tante Gerda kommt auch.', sayNow: 'Hab die Urlaubsfotos in meine Story gestellt.' },
  { id: 'de-sparbuch', decade: '1970', topic: 'money', then: 'Sparbuch und Weltspartag', now: 'Banking-App', note: 'Einmal im Jahr brachte man die Spardose zur Bank, bekam einen Stempel ins Sparbuch und ein kleines Geschenk.', sayThen: 'Am Weltspartag bring ich meine Spardose zur Sparkasse, da gibt’s was geschenkt!', sayNow: 'Ich überweis dir das schnell per App.' },
  { id: 'de-trimmdich', decade: '1970', topic: 'everyday', then: 'Trimm-dich-Pfad', now: 'Fitness-App', note: 'Holzschilder im Wald zeigten, wo man Klimmzüge und Hüpfer machen sollte.', sayThen: 'Sonntags laufen wir den Trimm-dich-Pfad, bei Station 7 gibt’s Liegestütze.', sayNow: 'Meine Fitness-App sagt, ich hab heute 10.000 Schritte.' },

  // --- 1980er ---------------------------------------------------------------
  { id: 'de-walkman', decade: '1980', topic: 'tech', then: 'Walkman', now: 'Kabellose Kopfhörer', note: 'Musik zum ersten Mal überall dabei, solange die Batterien hielten. Wurden sie schwach, leierte das Band.', sayThen: 'Hast du Batterien? Mein Walkman leiert schon.', sayNow: 'Meine Kopfhörer sind leer, ich muss sie laden.' },
  { id: 'de-videorekorder', decade: '1980', topic: 'media', then: 'Videorekorder', now: 'Mediathek', note: 'Aufnahme programmieren war eine Wissenschaft für sich, und oft lief am Ende der falsche Sender.', sayThen: 'Programmier bitte den Videorekorder, ich will den Tatort aufnehmen!', sayNow: 'Den Tatort guck ich später in der Mediathek.' },
  { id: 'de-telefonzelle', decade: '1980', topic: 'tech', then: 'Telefonzelle', now: 'Handy', note: 'Gelbe Häuschen an jeder Ecke. Wer unterwegs war, war nicht erreichbar, und man verabredete sich fest.', sayThen: 'Ich ruf dich um acht aus der Telefonzelle an, geh bitte selbst ran.', sayNow: 'Schreib mir, wenn du da bist.' },
  { id: 'de-telefonbuch', decade: '1980', topic: 'everyday', then: 'Telefonbuch', now: 'Suchmaschine', note: 'Dicke Bücher mit jeder Nummer der Stadt, dazu die Gelben Seiten für Handwerker und Geschäfte.', sayThen: 'Such die Nummer im Telefonbuch, unter M wie Müller.', sayNow: 'Such die Nummer einfach im Internet.' },
  { id: 'de-mitschneiden', decade: '1980', topic: 'media', then: 'Hitparade mitschneiden', now: 'Song speichern', note: 'Finger auf Aufnahme und Pause, und bloß hoffen, dass der Moderator nicht reinquatscht.', sayThen: 'Psst, gleich kommt mein Lied im Radio, ich drück auf Aufnahme!', sayNow: 'Wie heißt das Lied? Warte, ich lass es von der App erkennen.' },
  { id: 'de-euroscheck', decade: '1980', topic: 'money', then: 'Euroscheck', now: 'Mit dem Handy zahlen', note: 'Scheck ausfüllen, unterschreiben, Scheckkarte zeigen: so bezahlte man größere Beträge, auch im Urlaub.', sayThen: 'Kann ich mit Euroscheck bezahlen?', sayNow: 'Ich halt einfach das Handy ans Lesegerät.' },
  { id: 'de-aetzend', decade: '1980', topic: 'talk', then: 'ätzend', now: 'mies', note: 'Was nervte, war ätzend. Was gut war, war geil, und das sagte man auch vor den Eltern.', sayThen: 'Mathe ist total ätzend, aber das Konzert war echt geil!', sayNow: 'Mathe ist echt mies, aber das Konzert war richtig gut!' },
  { id: 'de-btx', decade: '1980', topic: 'tech', then: 'Bildschirmtext (Btx)', now: 'Internet', note: 'Seiten mit Klötzchengrafik am Fernseher, über die Telefonleitung. Der Vorläufer des Internets in Deutschland.', sayThen: 'Papa hat Btx, da kann man sogar die Bahnauskunft am Fernseher abrufen!', sayNow: 'Guck mal in der Bahn-App, ob der Zug Verspätung hat.' },
  { id: 'de-telespiel', decade: '1980', topic: 'games', then: 'Telespiel', now: 'Videospiel', note: 'So hießen die ersten Spielkonsolen, die man an den Fernseher anschloss.', sayThen: 'Komm nach der Schule rüber, wir haben ein neues Telespiel!', sayNow: 'Zock mit, ich schick dir eine Einladung.' },

  // --- 1990er ---------------------------------------------------------------
  { id: 'de-modem', decade: '1990', topic: 'tech', then: 'Einwählen mit dem Modem', now: 'WLAN', note: 'Erst piepte und rauschte es, dann war man drin. Telefonieren ging solange nicht, und jede Minute kostete.', sayThen: 'Geh vom Telefon runter, ich will ins Internet!', sayNow: 'Wie ist das WLAN-Passwort?' },
  { id: 'de-pager', decade: '1990', topic: 'tech', then: 'Pager', now: 'Push-Nachricht', note: 'Ein kleiner Piepser am Gürtel zeigte eine Nummer oder ein paar Wörter, zurückrufen musste man von der Zelle.', sayThen: 'Piep mich an, wenn du da bist.', sayNow: 'Ich hab Benachrichtigungen an, schreib einfach.' },
  { id: 'de-diskette', decade: '1990', topic: 'tech', then: 'Diskette', now: 'Cloud', note: '1,44 Megabyte, also nicht mal ein Handyfoto. Das Speichern-Symbol in vielen Programmen ist bis heute eine Diskette.', sayThen: 'Speicher das Referat auf Diskette, sonst ist es weg!', sayNow: 'Liegt alles in der Cloud.' },
  { id: 'de-videothek', decade: '1990', topic: 'media', then: 'Videothek', now: 'Streamingdienst', note: 'Freitagabend durch die Regale stöbern, und wehe, man brachte die Kassette nicht zurückgespult zurück.', sayThen: 'Wir holen uns heute was aus der Videothek, aber morgen bis 18 Uhr zurückbringen!', sayNow: 'Was läuft heute im Stream?' },
  { id: 'de-dmark', decade: '1990', topic: 'money', then: 'D-Mark', now: 'Euro', note: 'Bis Ende 2001 bezahlte man mit der Mark. Ein Euro sind 1,95583 Mark, und viele rechnen heimlich bis heute um.', sayThen: 'Das kostet zwanzig Mark.', sayNow: 'Das macht zehn Euro.' },
  { id: 'de-stadtplan', decade: '1990', topic: 'everyday', then: 'Stadtplan', now: 'Karten-App', note: 'Ein Faltplan, der sich nie wieder richtig zusammenfalten ließ.', sayThen: 'Wo sind wir? Gib mal den Stadtplan, aber falt ihn bitte richtig zusammen.', sayNow: 'Ich mach die Karten-App an.' },
  { id: 'de-brieffreund', decade: '1990', topic: 'everyday', then: 'Brieffreundschaft', now: 'Online-Freunde', note: 'Briefe ins Ausland, wochenlanges Warten auf Antwort, manchmal mit Foto im Umschlag.', sayThen: 'Meine Brieffreundin aus Frankreich hat endlich zurückgeschrieben!', sayNow: 'Wir zocken immer online zusammen, wir kennen uns übers Internet.' },
  { id: 'de-fett', decade: '1990', topic: 'talk', then: 'fett', now: 'krass', note: 'Was richtig gut war, war fett, oder gleich „voll fett, Alter“.', sayThen: 'Der Beat ist voll fett, Alter!', sayNow: 'Der Beat ist richtig krass!' },
  { id: 'de-passwort', decade: '1990', topic: 'games', then: 'Level-Passwort', now: 'Automatisches Speichern', note: 'Viele Spiele konnten nicht speichern. Man schrieb sich stattdessen einen Code ab, um später weiterzumachen.', sayThen: 'Schreib dir das Passwort für Level 5 auf, sonst musst du von vorn!', sayNow: 'Keine Sorge, das Spiel speichert automatisch.' },
  { id: 'de-cheat', decade: '1990', topic: 'games', then: 'Tipps aus der Spielezeitschrift', now: 'Lösungsvideo', note: 'Cheats und Komplettlösungen standen im Heft, und man tauschte sie auf dem Schulhof.', sayThen: 'In der neuen Zeitschrift steht ein Cheat für unendlich Leben!', sayNow: 'Guck dir einfach ein Lösungsvideo an.' },

  // --- 2000er ---------------------------------------------------------------
  { id: 'de-simsen', decade: '2000', topic: 'tech', then: 'simsen', now: 'chatten', note: 'Eine SMS hatte 160 Zeichen und kostete 19 Cent, also schrieb man kurz: „hdl“ und „gn8“.', sayThen: 'Ich sims dir später, hab nur noch zwei Euro Guthaben.', sayNow: 'Schreib mir einfach im Chat.' },
  { id: 'de-guthaben', decade: '2000', topic: 'money', then: 'Prepaid-Guthaben aufladen', now: 'Flatrate', note: 'Aufladekarte am Kiosk kaufen, Code freirubbeln, eintippen. War das Guthaben leer, ging nichts mehr.', sayThen: 'Ich muss erst mein Handy aufladen, also das Guthaben.', sayNow: 'Ich hab eh eine Flat.' },
  { id: 'de-klingelton', decade: '2000', topic: 'media', then: 'Klingelton-Abo', now: 'Lautlos', note: 'Polyphone Klingeltöne per SMS bestellt, oft mit teurem Abo dahinter. Der Frosch war überall.', sayThen: 'Ich hab mir den neuen Klingelton geladen, hör mal!', sayNow: 'Mein Handy ist sowieso immer auf lautlos.' },
  { id: 'de-mp3player', decade: '2000', topic: 'media', then: 'MP3-Player', now: 'Streaming-App', note: 'Lieder einzeln vom Computer rüberziehen, und nach 30 Songs war der Speicher voll.', sayThen: 'Auf meinen MP3-Player passen 128 Megabyte, also so 30 Lieder!', sayNow: 'Ich hab 100 Millionen Songs in der App.' },
  { id: 'de-gruscheln', decade: '2000', topic: 'everyday', then: 'gruscheln', now: 'ein Like geben', note: 'Auf StudiVZ und SchülerVZ zeigte man so, dass man jemanden mochte: grüßen plus kuscheln.', sayThen: 'Er hat mich gestern auf StudiVZ gegruschelt!', sayNow: 'Er hat meine Story geliked.' },
  { id: 'de-digicam', decade: '2000', topic: 'tech', then: 'Digicam', now: 'Handykamera', note: 'Eine eigene kleine Kamera mit Speicherkarte und Ladekabel, die man nie dabei hatte, wenn man sie brauchte.', sayThen: 'Hast du die Digicam eingepackt? Und das Ladekabel?', sayNow: 'Mach mal schnell ein Foto mit dem Handy.' },
  { id: 'de-internetcafe', decade: '2000', topic: 'everyday', then: 'Internetcafé', now: 'Mobiles Internet', note: 'Für E-Mails im Urlaub zahlte man pro halbe Stunde am fremden Computer.', sayThen: 'Ich geh kurz ins Internetcafé, Mails checken.', sayNow: 'Ich hab überall Netz, außer im Zug.' },
  { id: 'de-hammer', decade: '2000', topic: 'talk', then: 'Das ist der Hammer!', now: 'Das ist wild!', note: 'Alles Unglaubliche war der Hammer, gern mit einem langen „Boah“ davor.', sayThen: 'Boah, das ist der Hammer!', sayNow: 'Das ist so wild!' },

  // --- 2010er ---------------------------------------------------------------
  { id: 'de-swag', decade: '2010', topic: 'talk', then: 'Swag', now: 'Aura', note: 'Wer Swag hatte, war lässig und selbstbewusst. Heute sagt man, jemand hat Aura (Jugendwort 2024).', sayThen: 'Der hat voll Swag.', sayNow: 'Der hat krass Aura.' },
  { id: 'de-yolo', decade: '2010', topic: 'talk', then: 'YOLO', now: 'Einfach machen', note: 'Jugendwort 2012: „You only live once“, die Ausrede für jede verrückte Idee.', sayThen: 'Ich spring einfach, YOLO!', sayNow: 'Komm, einfach machen.' },
  { id: 'de-rofl', decade: '2010', topic: 'talk', then: 'lol und rofl', now: '💀 und 😭', note: 'Früher lachte man in Buchstaben. Heute schickt man den Totenkopf, weil man sich „totgelacht“ hat.', sayThen: 'rofl, ich lieg am Boden!', sayNow: '💀💀💀' },
  { id: 'de-status', decade: '2010', topic: 'media', then: 'Statusmeldung', now: 'Story', note: 'Was man gerade machte, stand als Text auf der Pinnwand und blieb dort für immer.', sayThen: 'Hast du meinen neuen Status gesehen?', sayNow: 'Hast du meine Story gesehen? Die ist nur 24 Stunden da.' },
  { id: 'de-harlemshake', decade: '2010', topic: 'media', then: 'Harlem Shake', now: 'TikTok-Trend', note: 'Eine Person tanzt allein, dann der Schnitt, und alle drehen durch. Millionen Videos in ein paar Wochen.', sayThen: 'Wir machen den Harlem Shake und stellen ihn auf YouTube!', sayNow: 'Lass uns den neuen Trend nachtanzen.' },
  { id: 'de-netbook', decade: '2010', topic: 'tech', then: 'Netbook', now: 'Tablet', note: 'Ein winziger, langsamer Laptop, der in jede Tasche passte.', sayThen: 'Mein Netbook passt in jede Handtasche!', sayNow: 'Ich nehm einfach das Tablet mit.' },
  { id: 'de-browsergame', decade: '2010', topic: 'games', then: 'Browserspiel', now: 'Handyspiel', note: 'Bauernhöfe und Städte im Netzwerk, und die Freunde mussten beim Gießen helfen.', sayThen: 'Kannst du auf meinem Hof die Felder gießen?', sayNow: 'Schick mir ein Leben, ich häng bei Level 400.' },
];

const EN: GlossaryEntry[] = [
  // --- 1960s ----------------------------------------------------------------
  { id: 'en-rotary', decade: '1960', topic: 'tech', then: 'Rotary phone', now: 'Smartphone', note: 'It hung on the kitchen wall with a long curly cord, and you dialed every number with your finger.', sayThen: 'Hush, I’m dialing. If I mess up, I have to start over.', sayNow: 'I’ll just send you a voice memo.' },
  { id: 'en-partyline', decade: '1960', topic: 'tech', then: 'Party line', now: 'Group chat', note: 'Several households shared one phone line, and the neighbors could pick up and listen in.', sayThen: 'Mrs. Johnson, would you please get off the line? I need to make a call.', sayNow: 'I’ll drop it in the group chat.' },
  { id: 'en-longdistance', decade: '1960', topic: 'money', then: 'Long-distance call', now: 'Video call', note: 'Calling another state cost by the minute, so the whole family crowded around the phone and talked fast.', sayThen: 'Keep it short, this is long distance!', sayNow: 'Let’s video call, it’s free.' },
  { id: 'en-milkman', decade: '1960', topic: 'everyday', then: 'The milkman', now: 'Grocery delivery', note: 'Fresh milk in glass bottles on the porch every morning, and you left the empties out for him.', sayThen: 'Put the empty bottles out on the porch for the milkman.', sayNow: 'The groceries are getting delivered at six.' },
  { id: 'en-greenstamps', decade: '1960', topic: 'money', then: 'S&H Green Stamps', now: 'Rewards app', note: 'You got stamps with your groceries, licked them into books and traded full books for a toaster.', sayThen: 'Lick these stamps into the book, we’re saving up for a toaster.', sayNow: 'Scan the app at checkout, I get points.' },
  { id: 'en-signoff', decade: '1960', topic: 'media', then: 'TV sign-off', now: 'Streaming all night', note: 'Late at night the station played the anthem, then the test pattern, then static.', sayThen: 'Off to bed, the station’s signing off anyway.', sayNow: 'One more episode, then I’m done.' },
  { id: 'en-groovy', decade: '1960', topic: 'talk', then: 'Groovy', now: 'A vibe', note: 'Anything cool and relaxed was groovy, man.', sayThen: 'That party was real groovy, man.', sayNow: 'That party was such a vibe.' },
  { id: 'en-drivein', decade: '1960', topic: 'media', then: 'Drive-in movie', now: 'Movie night at home', note: 'A speaker hooked on the car window, a double feature, and the whole family in pajamas in the back seat.', sayThen: 'Let’s catch the double feature at the drive-in.', sayNow: 'Let’s just stream something tonight.' },

  // --- 1970s ----------------------------------------------------------------
  { id: 'en-8track', decade: '1970', topic: 'tech', then: '8-track tape', now: 'Phone on Bluetooth', note: 'The tape clunked from track to track, sometimes right in the middle of a song.', sayThen: 'Pop in the 8-track, it’s a long drive.', sayNow: 'Connect your phone to the car.' },
  { id: 'en-cb', decade: '1970', topic: 'tech', then: 'CB radio', now: 'Traffic app', note: 'Truckers and families warned each other about speed traps with their own lingo: “smokey” meant police.', sayThen: 'Breaker one-nine, got any smokeys on the interstate?', sayNow: 'The app says there’s a speed trap ahead.' },
  { id: 'en-rabbitears', decade: '1970', topic: 'tech', then: 'Rabbit ears', now: 'Smart TV', note: 'Two antennas on top of the set, and someone had to stand there holding them just right.', sayThen: 'Wiggle the rabbit ears, the picture’s all fuzzy!', sayNow: 'The Wi-Fi’s slow, the show keeps buffering.' },
  { id: 'en-encyclopedia', decade: '1970', topic: 'everyday', then: 'Encyclopedia set', now: 'Looking it up online', note: 'Twenty-some heavy volumes in the living room, often bought from a door-to-door salesman.', sayThen: 'Look it up in the encyclopedia, volume M.', sayNow: 'Just look it up on your phone.' },
  { id: 'en-layaway', decade: '1970', topic: 'money', then: 'Layaway', now: 'Buy now, pay later', note: 'The store kept the item in the back while you paid a little each week. You took it home when it was paid off.', sayThen: 'I put the bike on layaway till Christmas.', sayNow: 'I split it into four payments at checkout.' },
  { id: 'en-farout', decade: '1970', topic: 'talk', then: 'Far out!', now: 'That’s fire!', note: 'The 70s way to say something was amazing.', sayThen: 'Far out! You got tickets?', sayNow: 'That’s fire! You got tickets?' },
  { id: 'en-mixtape', decade: '1970', topic: 'media', then: 'Mixtape', now: 'Playlist', note: 'Songs taped one by one off records or the radio, with a hand-written cover: the love letter of its day.', sayThen: 'I made you a tape. Side B is just for you.', sayNow: 'I shared a playlist with you.' },
  { id: 'en-slideshow', decade: '1970', topic: 'media', then: 'Slide show night', now: 'Posting your story', note: 'The projector hummed, the screen came out, and the relatives sat through 200 slides of the Grand Canyon.', sayThen: 'Come over Sunday, we’re showing the vacation slides.', sayNow: 'I put the vacation pics in my story.' },

  // --- 1980s ----------------------------------------------------------------
  { id: 'en-walkman', decade: '1980', topic: 'tech', then: 'Walkman', now: 'Wireless earbuds', note: 'Music on the go for the first time, as long as the batteries lasted. When they got weak, the tape dragged.', sayThen: 'Got any batteries? My Walkman’s dragging.', sayNow: 'My earbuds are dead, I need to charge them.' },
  { id: 'en-vcr', decade: '1980', topic: 'media', then: 'Setting the VCR', now: 'On demand', note: 'Programming a recording was rocket science, and the clock blinked 12:00 forever.', sayThen: 'Set the VCR, I don’t want to miss Dallas!', sayNow: 'It’s on demand, watch it whenever.' },
  { id: 'en-rewind', decade: '1980', topic: 'media', then: 'Be kind, rewind', now: 'Skip intro', note: 'The sticker on every rental tape. Bring it back unrewound and you paid a fee.', sayThen: 'Be kind, rewind! I’m not paying that fee again.', sayNow: 'Hit “skip intro.”' },
  { id: 'en-payphone', decade: '1980', topic: 'tech', then: 'Pay phone', now: 'Cell phone', note: 'A quarter and a booth at the mall. Once you were out, nobody could reach you, so plans were plans.', sayThen: 'Call me from the pay phone at the mall at eight.', sayNow: 'Text me when you get to the mall.' },
  { id: 'en-answering', decade: '1980', topic: 'tech', then: 'Answering machine', now: 'Voicemail and voice memos', note: 'A tape at home that recorded messages, and everyone could hear who was calling.', sayThen: 'Leave a message at the beep… Mom, stop screening my calls!', sayNow: 'Just send me a voice memo.' },
  { id: 'en-yellowpages', decade: '1980', topic: 'everyday', then: 'Yellow Pages', now: 'Online reviews', note: '“Let your fingers do the walking”: a thick book with every business in town.', sayThen: 'Find a plumber in the Yellow Pages.', sayNow: 'Check the reviews online first.' },
  { id: 'en-rad', decade: '1980', topic: 'talk', then: 'Totally rad', now: 'That slaps', note: 'Rad, tubular, gnarly: the 80s had plenty of words for awesome.', sayThen: 'That new song is totally rad!', sayNow: 'That new song slaps!' },
  { id: 'en-quarter', decade: '1980', topic: 'games', then: 'A quarter for the arcade', now: 'In-app purchase', note: 'One more quarter meant one more life. Now the extra lives are in the app store.', sayThen: 'Lend me a quarter, I’m on the last level!', sayNow: 'I bought extra lives in the app.' },

  // --- 1990s ----------------------------------------------------------------
  { id: 'en-dialup', decade: '1990', topic: 'tech', then: 'Dial-up', now: 'Wi-Fi', note: 'Screech, beep, hiss, and you were online. Nobody could use the phone in the meantime.', sayThen: 'Get off the phone, I’m trying to get online!', sayNow: 'What’s the Wi-Fi password?' },
  { id: 'en-pager', decade: '1990', topic: 'tech', then: 'Pager', now: 'Push notification', note: 'A little beeper on your belt showed a number, and you called back from the nearest phone.', sayThen: 'Beep me 911 if it’s urgent.', sayNow: 'I have notifications on, just text me.' },
  { id: 'en-floppy', decade: '1990', topic: 'tech', then: 'Floppy disk', now: 'The cloud', note: '1.44 megabytes, less than one phone photo. The save icon in many programs is still a floppy.', sayThen: 'Save your report on a floppy, or it’s gone!', sayNow: 'It’s all in the cloud.' },
  { id: 'en-videostore', decade: '1990', topic: 'media', then: 'Video store', now: 'Streaming service', note: 'Friday night meant walking the aisles, hoping the new release wasn’t all checked out.', sayThen: 'Let’s hit the video store before all the new releases are gone.', sayNow: 'Let’s scroll for an hour and then pick nothing.' },
  { id: 'en-asl', decade: '1990', topic: 'everyday', then: 'Chat room', now: 'DMs', note: 'Strangers met in chat rooms, and the first question was always “a/s/l?” (age, sex, location).', sayThen: 'A/S/L?', sayNow: 'Slide into my DMs.' },
  { id: 'en-dabomb', decade: '1990', topic: 'talk', then: 'Da bomb', now: 'Goated', note: 'If it was the best, it was da bomb. Or all that and a bag of chips.', sayThen: 'This pizza is da bomb!', sayNow: 'This pizza is goated.' },
  { id: 'en-password', decade: '1990', topic: 'games', then: 'Level password', now: 'Autosave', note: 'Many games couldn’t save, so you wrote down a code to pick up where you left off.', sayThen: 'Write down the password for level 5, or you start over!', sayNow: 'Don’t worry, it autosaves.' },
  { id: 'en-tipline', decade: '1990', topic: 'games', then: 'The game tip hotline', now: 'Walkthrough video', note: 'Stuck in a game? You called a hotline (and paid by the minute) or waited for the next magazine.', sayThen: 'Can I call the tip line? I’m stuck in the water temple!', sayNow: 'Just watch a walkthrough.' },

  // --- 2000s ----------------------------------------------------------------
  { id: 'en-t9', decade: '2000', topic: 'tech', then: 'Texting on T9', now: 'Voice notes', note: 'Three letters per key: press 7 four times for an S. Texts cost extra, so you kept them short.', sayThen: 'Hold on, I’m pressing 7 four times for an S.', sayNow: 'Just send a voice note.' },
  { id: 'en-nights', decade: '2000', topic: 'money', then: 'Free nights and weekends', now: 'Unlimited plan', note: 'Cell minutes were precious during the day, so the long calls waited until after nine.', sayThen: 'Call me after nine, it’s free nights and weekends.', sayNow: 'I’ve got unlimited, call whenever.' },
  { id: 'en-ringtone', decade: '2000', topic: 'media', then: 'Downloaded ringtone', now: 'Silent mode', note: 'Ringtones cost money, often through a sneaky subscription, and everyone heard yours.', sayThen: 'Listen, I got the new ringtone!', sayNow: 'My phone’s always on silent anyway.' },
  { id: 'en-ipod', decade: '2000', topic: 'media', then: 'Burned CD', now: 'Shared playlist', note: 'A blank CD, a burner and a Sharpie: the 2000s mixtape.', sayThen: 'I burned you a CD for the road trip.', sayNow: 'I sent you the road trip playlist.' },
  { id: 'en-top8', decade: '2000', topic: 'everyday', then: 'MySpace Top 8', now: 'Close Friends list', note: 'Ranking your eight best friends on your profile, in public. It ended friendships.', sayThen: 'You’re not in my Top 8 anymore!', sayNow: 'I took you off my Close Friends.' },
  { id: 'en-digicam', decade: '2000', topic: 'tech', then: 'Digital camera', now: 'Phone camera', note: 'A separate little camera with a memory card and a charger you always forgot.', sayThen: 'Did you pack the digital camera? And the charger?', sayNow: 'Just snap it with your phone.' },
  { id: 'en-mapquest', decade: '2000', topic: 'everyday', then: 'Printed directions', now: 'Maps app', note: 'You printed the route at home, and one wrong exit meant you were lost.', sayThen: 'Did you print out the directions?', sayNow: 'The app is rerouting us around traffic.' },
  { id: 'en-hot', decade: '2000', topic: 'talk', then: 'That’s hot', now: 'Slay', note: 'The reality-TV catchphrase of the decade.', sayThen: 'New shoes? That’s hot.', sayNow: 'New shoes? Slay.' },

  // --- 2010s ----------------------------------------------------------------
  { id: 'en-swag', decade: '2010', topic: 'talk', then: 'Swag', now: 'Rizz', note: 'Swag was style and confidence. Today the cool kids talk about rizz (charm) and aura.', sayThen: 'He’s got so much swag.', sayNow: 'He’s got serious rizz.' },
  { id: 'en-fleek', decade: '2010', topic: 'talk', then: 'On fleek', now: 'Ate', note: 'Perfect, flawless, on point. Eyebrows were usually involved.', sayThen: 'Her eyebrows are on fleek!', sayNow: 'Her makeup ate.' },
  { id: 'en-lol', decade: '2010', topic: 'talk', then: 'LOL and ROFL', now: '💀 and 😭', note: 'People used to laugh in letters. Now they send a skull because they’re “dead.”', sayThen: 'ROFL, I can’t breathe!', sayNow: '💀💀💀' },
  { id: 'en-status', decade: '2010', topic: 'media', then: 'Status update', now: 'Story', note: 'What you were doing went on your wall as text and stayed there forever.', sayThen: 'Did you see my new status?', sayNow: 'Did you see my story? It’s gone in 24 hours.' },
  { id: 'en-vine', decade: '2010', topic: 'media', then: 'Vine', now: 'TikTok', note: 'Six-second looping videos that made stars, until the app shut down in 2017.', sayThen: 'Did you see that Vine? Six seconds of pure gold.', sayNow: 'Did you see that TikTok?' },
  { id: 'en-harlem', decade: '2010', topic: 'media', then: 'Harlem Shake', now: 'TikTok trend', note: 'One person dances alone, then the cut, and everyone goes wild. Millions of videos in a few weeks.', sayThen: 'Let’s do the Harlem Shake and post it on YouTube!', sayNow: 'Let’s learn the new trend.' },
  { id: 'en-netbook', decade: '2010', topic: 'tech', then: 'Netbook', now: 'Tablet', note: 'A tiny, slow laptop that fit in any bag.', sayThen: 'My netbook fits right in my purse!', sayNow: 'I’ll just bring the tablet.' },
  { id: 'en-farm', decade: '2010', topic: 'games', then: 'Facebook farm games', now: 'Mobile games', note: 'Virtual farms on social media, and your friends had to help water the crops.', sayThen: 'Can you water my crops? They’ll wither by tonight!', sayNow: 'Send me a life, I’m stuck on level 400.' },
];

/** The dictionary in the current language. */
export const GLOSSARY: GlossaryEntry[] = isGerman ? DE : EN;

/** The decades with entries, the journey's own decade first. */
export function glossaryDecades(focusDecade: string): string[] {
  const all = [...new Set(GLOSSARY.map((e) => e.decade))].sort();
  return all.includes(focusDecade) ? [focusDecade, ...all.filter((d) => d !== focusDecade)] : all;
}

/** Entries whose words, note or sentences contain the query (case- and accent-insensitive). */
export function searchGlossary(query: string): GlossaryEntry[] {
  const fold = (s: string) => s.toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = fold(query.trim());
  if (!q) return [];
  return GLOSSARY.filter((e) => fold([e.then, e.now, e.note, e.sayThen, e.sayNow].join(' ')).includes(q));
}
