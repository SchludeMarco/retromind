// "Was ist neu?" is fed straight from CHANGELOG.md, so every change that is
// logged there (see CLAUDE.md) shows up in the app without extra work. The
// file is bundled as raw text and parsed here into plain entries.
import changelog from '../CHANGELOG.md?raw';
import { isGerman } from './i18n';

export interface WhatsNewEntry {
  id: string;
  /** "Zeitreise", "Gaming-Edition" … when the title starts with a module name. */
  module?: string;
  title: string;
  date?: string;
  text: string;
  /** true when the English UI shows this entry in German (no translation yet). */
  germanOnly?: boolean;
}

export interface WhatsNewSection {
  /** "Unreleased" or a version number such as "2.0.1". */
  version: string;
  entries: WhatsNewEntry[];
}

const SEEN_KEY = 'retromind.whatsnew.seen';
const MODULES = ['Zeitreise', 'Gaming-Edition'];

// Entries that only concern the repository, not the app people use.
const HIDDEN_TITLES = /^(Dokumentation|Entwicklung)\b/;

// English versions of the newest entries, keyed by the German bold title
// exactly as it stands in CHANGELOG.md. CHANGELOG.md stays German; entries
// without a translation here appear in German in the English UI, marked
// "German only".
const EN: Record<string, { title: string; text: string }> = {
  'Nichts mehr unter dem Griff, nichts mehr über dem Rand': {
    title: 'Nothing under the handle, nothing past the edge',
    text: 'On phones the handle at the right edge covered text, and in “Today in your youth” long words ran past the edge of the card. Now the page leaves room for the handle on the right (Time Travel and the arcade), long words wrap, and the welcome card stays fully on screen on narrow phones too.',
  },
  'Titelmusik beim Öffnen eines Spiels': {
    title: 'Title music when you open a game',
    text: 'When you open a game page in the Gaming edition, the first 20 seconds of its soundtrack play first, usually the title music. “SKIP ►” jumps straight to the gameplay video; after the title music it waits, paused, at the top until you start it. The music comes through the YouTube player, so only once you have allowed YouTube, and it stays silent while sound is off.',
  },
  'Schatzkiste und klügere Bandvorschläge': {
    title: 'Treasure chest and smarter band ideas',
    text: 'In Time Travel, the ideas for your favorite bands now follow what is already on your list: add Nirvana and you get Pearl Jam and Green Day, like Michael Jackson and you get Prince and Whitney Houston. There is also a “Legends of all time” row for every age, with Elvis, the Beatles, Michael Jackson, Queen, ABBA and more. Every idea now has a small ✕ for “doesn’t fit me / don’t know it”; it disappears and comes back with one tap. New is the treasure chest (when packing your suitcase and in the settings, optional and closed at first): favorite film and game characters (like Solid Snake or Kazuhira Miller), special games (Super Meat Boy), books and comics, special places (the school library with video tapes) and events, smells (cinnamon, your own room), old shops, card games (Yu-Gi-Oh!, Pokémon, Digimon) and lines from old films and games. The ideas are sorted by decade to fit your birth year. Whatever is in the chest goes into the questions on your journey and into the memory book.',
  },
  'Gamer-Fakten im Laufband der Spielhalle': {
    title: 'Gamer facts in the arcade ticker',
    text: 'The fun-fact ticker of the Gaming edition has new stories: how Mew was slipped into Pokémon Red and Green at the last minute, why Mewtwo is number 150, the rumor about the truck by the S.S. Anne, how the Pokémon, Yu-Gi-Oh! and Digimon card games began, and that Super Meat Boy was made by just two people.',
  },
  'Blitze spiegeln sich in der Uhr': {
    title: 'The lightning reflects in the clock',
    text: 'With every flash of lightning on the Time Travel welcome screen, the mantel clock lights up for a moment. A cold sheen falls over the case, the brass rim gleams on the side the bolt comes from (above, left or right), and a bright streak of light runs across the glass. With “reduce motion”, the clock stays still.',
  },
  'Donner zu den Blitzen': {
    title: 'Thunder for the lightning',
    text: 'You can now hear the lightning on the Time Travel welcome screen too. Every bolt cracks, then the thunder rolls on for a few seconds. The bolt that strikes the clock is loud and cracks at once; the two distant ones rumble more quietly and a little later. Like every sound at the start, the thunder only gets louder slowly, and it stays silent when sound is off.',
  },
  'Startbildschirm wie aus einem Zeitreisefilm': {
    title: 'A welcome screen straight out of a time-travel film',
    text: 'The heading and the “Go back...” button of Time Travel are new, in the spirit of “Back to the Future”. Lightning flickers over the mantel clock and lights up the room for a moment, one bolt strikes the clock. “RetroMind” stands slanted in chrome and fire, with a trail of fire beneath it. Time circuits show the destination time (your birthday, if you have been here before) and the present. Starting is now a flux button “Go back in time” with a speedometer: press it and it races to 88 MPH, lightning strikes non-stop, two trails of fire streak across the floor, then the time machine pulls you in. With “reduce motion” on your device nothing flickers. The little white flag after “The ticket to your past” is gone.',
  },
  'Bildschirmfarbe von Blau bis Orange': {
    title: 'Screen color from blue to orange',
    text: 'The settings (handle at the right edge) now have a new “Screen color” slider below the text size. Slide it right and everything turns warmer and more orange, like the night light on a phone; slide it left and it turns cooler and bluer. In the middle the app looks as designed. The slider works in every design of Time Travel and in the arcade (there under “Screen”), and your choice carries over to the other app and to your other devices. “Back to normal” resets the color.',
  },
  'Die ganze Steuerung hinter einem Griff am rechten Rand': {
    title: 'All the controls behind one handle at the right edge',
    text: 'In Time Travel and in the Gaming edition, a small handle with three sliders now sits at the right edge of the screen, halfway down. One tap slides in a panel from the right with everything: in Time Travel the seven stops of the journey, the music, sound on/off, the companion and feedback; in the arcade the sections (Catalog to Quests), the music, sound, the Guru, feedback and “Leave the club”; below that, all the settings. In return, the many buttons over the page are gone: the gear, the speaker, the music in the top left, the accounts in the bottom left, the home and companion buttons, the Retro Warm bottom bar, the journey bar’s floating pill, and in the arcade the buttons at the top and the bar at the bottom. From the panel you can now also reach the arcade from every stop of the journey.',
  },
  'Jeden Tag etwas Neues in der Stube': {
    title: 'Something new in the living room every day',
    text: 'Below the living room there is now a new question of the day every day (“How did you celebrate your birthday as a child?”). Your answer becomes a new page in your memory book, so it keeps on growing. Below it, “Today in your youth” shows what happened on this date when you were between 6 and 20, with the No. 1 hit of that year. Also new is the family book: everyone invited gets the same question every Monday and reads the others’ answers. Before your first answer goes to our server, the app asks for your permission once; you can change or delete it at any time. If you come back after two days or more, a letter in the living room tells you what is new since then.',
  },
  'RetroMind als App aufs Handy': {
    title: 'RetroMind as an app on your phone',
    text: 'Time Travel can now be installed as an app like the Gaming edition, with its own icon. On Android, Chrome often didn’t offer to install at all; that is fixed in both apps. An “Add to home screen” button (start page and settings of Time Travel, settings of the Gaming edition) installs with one tap or shows the two or three steps in the browser menu. Next to it, “Add to my calendar” puts a reminder for every Sunday morning into your own calendar, without RetroMind storing anything for it.',
  },
  'Gaming-Edition: Serie und Wochen-Duell': {
    title: 'Streak and weekly duel',
    text: 'Every day in a row in the arcade pays Coins, from 5 up to 30, and every seventh day 25 extra; one missed day per week is forgiven. Your streak shows in the top bar. Under “Quests” there is also a weekly duel: everyone plays the same mini game, and its own high score table shows the best of the week.',
  },
  'Diskette auch im Gaming-Ticker': {
    title: 'Floppy disks in the gaming ticker too',
    text: 'Every fun fact in the arcade ticker now has a floppy disk behind it. Tap it to put the entry in the Grabbelkiste, tap again to take it out. The box at the start of the ticker counts along and shows everything you collected. It is the same Grabbelkiste as in the time travel: sayings and fun facts end up in one box, in both apps and on all your devices.',
  },
  'Laufbänder zum Zurückholen und Weiterblättern': {
    title: 'Tickers you can rewind and skip',
    text: 'The fun facts in the gaming edition now run at the very bottom, just above the navigation buttons, like the ticker in the time travel. Both tickers move more slowly and you can push them back and forth with your finger; a flick carries them a little further. New arrows ‹ and › next to them take you back to the entry that just went by, or on to the next one. The tickers never run out: new entries keep coming, in the time travel now also a line for every year with its No. 1 hit, in the arcade fun facts and release years for every catalog game (tap to open the game). Once everything has run past, the AI adds fresh entries. Your device remembers the last entries shown, so you can scroll back even after reloading.',
  },
  'Lieblingsbands aus deinem ganzen Leben': {
    title: 'Favorite bands from your whole life',
    text: 'When you pack your suitcase before setting off, and in the settings under “Your details”, there is now “Need ideas?”. A tap on it shows, for every five years from your birth year until today, the bands and musicians that were big back then, with your age at the time. Tap a name to put it on your list, tap again to take it off; you can still type your own names. It all stays optional, and the ideas stay closed until you open them. Your favorite bands now also go into the personal questions while exploring and appear in your memory book.',
  },
  'Hall of Fame zum Blättern, Laufband zum Ziehen': {
    title: 'Browse the Hall of Fame, drag the ticker',
    text: 'In the Gaming edition, the Hall of Fame (it starts after a minute without input) now lets you go to the previous game or on to the next random one with ◀ and ▶ or a swipe. Tapping the game opens its page, tapping next to it takes you back to the hall as before. The ticker with sayings on the Time Travel start page can be dragged back and forth with your finger and keeps running on its own afterwards.',
  },
  'Google-Anmeldung bleibt auf jedem Gerät': {
    title: 'Your Google sign-in stays on every device',
    text: 'Until now Google wanted another tap on “Sign in” after an hour. Now you stay signed in on every device until you sign out, in Time Travel and in the Gaming edition alike. The next time you sign in, Google asks for your consent once, then never again. Signing out only applies to the device you do it on.',
  },
  'Spotify-Anmeldung gilt in beiden Apps': {
    title: 'Your Spotify sign-in counts in both apps',
    text: 'If you are signed in with Spotify in Time Travel or in the Gaming edition, you now are in the other app too, and signing out counts for both. Signed in with Google, your Spotify sign-in also applies on all your devices. Every switch between the apps takes your Google sign-in along; after an hour, though, Google wants another tap on “Sign in”, which then also counts for the other app at the next switch.',
  },
  'Zeitreise und Gaming sind jetzt eine App': {
    title: 'Time Travel and Gaming are now one app',
    text: 'Everything RetroMind remembers is the same in both apps: language, volume, journey, profile, save game, coins, high-score initials and settings. When you follow a link from Time Travel into the arcade or back, the link takes your data along, even without signing in. Signed in with Google, all your devices stay in sync too: every change reaches your Google Drive within a second or two, and each app fetches the latest data when it opens and when you come back to it. If the cloud already holds different data than your device, RetroMind asks once which should count (recommended: the cloud). Sign-ins and privacy choices stay on each device; the privacy policy explains this.',
  },
  'Dein eigenes Kürzel wie am Flipper': {
    title: 'Your own initials, like on a pinball machine',
    text: 'In the settings of both apps you can now enter your own three-character initials, like on the old pinball high score tables, for example LIQ or MAR. Set each character with ▲ and ▼ or simply type it. In the Gaming edition they are already filled in at every high score table, which now has the same arcade-style entry. Your initials stay on your device; with Google sign-in they are also kept in your Google account, so they apply on all your devices and in both apps. If your account holds different initials than your device, RetroMind asks whether to take the ones from your account; if you say no, yours stay and you aren’t asked again for those initials.',
  },
  'Zwei neue Spiele für die Retro-Konsole': {
    title: 'Two new games for the retro console',
    text: 'The Gaming edition’s chill corner now has four free games. New are “µCity” for the Game Boy Color, where you build your own city like in SimCity, and “Thwaite” for the NES, where you defend villages against incoming missiles like in Missile Command. Both are free software whose makers explicitly allow sharing them.',
  },
  'Die Retro-Konsole: alte Spiele direkt im Browser spielen': {
    title: 'The retro console: play old games right in your browser',
    text: 'The Gaming edition’s chill corner now has an emulator that recreates real old consoles. Two free games whose makers allow sharing them start with one tap: “Tobu Tobu Girl” for the Game Boy and the memory game “Concentration Room” for the NES. Under “Your own module” you can also load a game file from your device, for NES, SNES, Game Boy, Game Boy Advance, Mega Drive, Master System, Game Gear, Atari 2600 and PC Engine; on the game pages of these systems the button is called “Play with your own file”. RetroMind provides no commercial games, and your file stays on your device. Play with keyboard, gamepad or touch buttons on your phone; saves stay in your browser. The delete button under “My data” removes them too, and the privacy policy explains this.',
  },
  'Spiele in der Gaming-Edition nach Jahr sortiert': {
    title: 'Games in the Gaming edition sorted by year',
    text: 'In the gaming hall the games are now ordered by release year, oldest first. That goes for the catalog with every filter, for the games from the Wikipedia archive and for your collection (“My stash” and “Had it back then”). Games without a known year come last. When you load more archive games with “Gimme more”, they slot in at the right place. Search still shows the best matches first.',
  },
  'Die Spielhalle nebenan ist nicht mehr zu übersehen': {
    title: 'You can’t miss the arcade next door anymore',
    text: 'A glowing arcade machine now stands in the corner of the living room under a neon “GAMING” sign, with an invader on its screen and blinking coin slots. Tap it and you’re in RetroMind – Gaming. Right under “Start the time travel” a new card “The arcade next door” also shows a photo of the entrance and what waits for you in the Gaming edition; the “To the gaming zone” signpost now stands there instead of at the very bottom of the page. On computers the things in the living room also react to mouse clicks more reliably.',
  },
  'Rote Blinklichter am Gaming-Wegweiser': {
    title: 'Red flashing lights on the gaming signpost',
    text: 'Two red warning lamps like at a level crossing now sit on top of the “To the gaming zone” signpost and flash in turn, so nobody misses that the Gaming edition is right next door. If you chose reduced motion in your system settings, they glow steadily instead.',
  },
  'Echte Spiele-Cover sind zurück': {
    title: 'Real game covers are back',
    text: 'In the Gaming edition the game cards, the game page and the cartridge slot show each game’s real cover again. That’s possible because RetroMind is now only open to family and close friends. If there is no cover, or while it loads, you see the pixel picture as before.',
  },
  'Einmal anmelden, überall drin': {
    title: 'Sign in once, you’re in everywhere',
    text: 'Signing in with Google at the guest door now also counts as your Google sign-in inside Time Travel and the Gaming edition, so you don’t have to sign in again inside. When you switch between the two editions via the signpost or “Back to RetroMind”, your guest access and Google sign-in come along and you don’t meet the door again.',
  },
  'Spotify Premium auf dem Handy: ganze Songs auch in der Gaming-Halle': {
    title: 'Spotify Premium on your phone: full songs in the gaming hall too',
    text: 'Signed in with Spotify Premium, the gaming hall on your phone now plays full songs instead of 30-second previews, just like the time journey. The music plays in your own Spotify app; RetroMind only tells it which song comes next. If RetroMind can’t find the app, open it for a moment and tap “Try again” in the music player. In front of the door you still hear a muffled clip of the song, and inside it plays in full.',
  },
  'RetroMind nur noch für eingeladene Gäste': {
    title: 'RetroMind is now for invited guests only',
    text: 'Time Travel and the Gaming edition are now a private offer. Anyone opening RetroMind first lands on a guest page and signs in once with Google. Only addresses Marco invited in the admin area under “Guests” get in; after that you stay signed in until 30 days after your last visit. The privacy policy and legal notice stay open to everyone, and the privacy policy explains the new cookie.',
  },
  'Mehr Datenschutz: Meine Daten, KI-Hinweise und eigene Figuren': {
    title: 'More privacy: your data, AI labels and figures of our own',
    text: 'The settings of both apps now have “Your data” / “My data”: one button downloads everything RetroMind stored in your browser as a file, another deletes all of it. The Nostalgia Buddy and the Retro Guru now say right away that they are an AI (Google Gemini), and AI videos are labeled “AI-generated”. Under Google’s rules the AI features are for ages 18 and over; in Time Travel they stay off when the date of birth makes you younger than 18. The short hit clip when you arrive in a year now only plays if you allowed music. In the gaming hall two mini-games are now called Brick Bash and Color Echo, a muncher robot of our own and a little bug wander through the hall instead of Pac-Man, and rude initials on the high score board become “XXX”. The privacy policy is up to date (YouTube videos in Time Travel, children and teenagers, downloading and deleting your data).',
  },
  'Wegweiser mit gelbem Leuchtband': {
    title: 'Signpost wrapped in a yellow light strip',
    text: 'A yellow light strip is now wound around the “To the gaming zone” signpost, running in front of the board and behind it. Little lights keep chasing along it and the strip glows softly. The red frame is no longer bright but matte and dusty. If you have turned off motion, the strip glows without moving.',
  },
  'Rot umrandeter Wegweiser': {
    title: 'Signpost with a red frame',
    text: 'The “To the gaming zone” signpost on the time travel start page now has a bold red frame along its torn edge, with a soft red glow behind it that slowly pulses. That way it catches your eye on every background. If you have turned off motion, the glow stays still.',
  },
  'Kartenspiele in der Chill-Ecke: Video-Poker, Blackjack und Solitär': {
    title: 'Card games in the chill corner: video poker, blackjack and solitaire',
    text: 'The gaming hall now has three card games. In video poker (“Jacks or Better” like the poker machines of old) you bet 1 to 5 credits, get five cards, tap the ones you want to hold and draw once; a pair of jacks or better pays, and with the full bet the royal flush pays 4000. In blackjack you play against the dealer: hit, stand or double down, the dealer stands on 17 and a blackjack pays 3 to 2. A session lasts 20 hands (poker) or 10 hands (blackjack) with 100 play credits, and you only ever play for play money; whatever is left at the end goes on the high score table. In solitaire (like on every old Windows PC) you build each suit from ace to king: tap a card, then tap where it goes, or tap it twice and it finds the best place on its own. Undo always works, and once everything is face up, one button sends all the cards home. Your best time counts. The cards are a pixel deck of their own with a back in your design’s color, click softly as they are dealt and work with touch, mouse and keyboard.',
  },
  'Die Zeitreise reagiert auf jede Berührung': {
    title: 'The time travel answers every touch',
    text: 'Every button, card and link now responds at once: a soft wooden “tock” like the key of an old typewriter, a short buzz on your phone, a ring of light spreading from your finger and a little spring-back. When you move to another stop, a page audibly turns, the new stop slides in from the side the journey is heading and a band of light sweeps across the screen. Cards and sections drift into place one after another as you scroll. Windows open with a small “blop”, and when you save a memory a music-box chime sounds and stars and hearts burst where you tapped. Even when you do nothing, the page is alive: dust dances in the light (fireflies in Night Shift), the travel clock’s seconds hand keeps ticking, and after a while without a tap the button to the next stop gently breathes so you know where to go. The sounds are short and quiet, come without delay (they are no longer downloaded each time) and stay silent with the sound off. If you prefer less motion, you only get the sounds and a calm glow.',
  },
  'Keine Musik mehr über dem Jahresvideo': {
    title: 'No more music over the year’s video',
    text: 'At the start, the Spotify music kept playing over the video from your year, so the video was hard to follow. Now the video starts once the arrival show is over, and the music stays quiet while it runs. Hide the video and the music plays on.',
  },
  'Musik hängt nicht mehr bei „Lädt …“': {
    title: 'Music no longer hangs on “Loading …”',
    text: 'When the Spotify player was set up again (for example because your Spotify login arrived after the start, or the Spotify app on your phone wasn’t found), the music in the time travel and in the gaming hall got stuck on “Loading playlist”. Now the new player starts as usual.',
  },
  'Mehr Weihnachtslichter und Weihnachtsklänge': {
    title: 'More Christmas lights and Christmas sounds',
    text: 'During the Christmas season, lots of small colorful lights now twinkle behind the pages, and the fairy lights along the top have almost twice as many bulbs, each blinking at its own pace. Every minute or two a short, quiet jingle sounds, with sleigh bells and the first notes of “Jingle Bells”, and every third time Santa adds a “Ho ho ho”. The first jingle only comes a while after your first tap and swells in gently. With the sound off everything stays quiet. In the settings you can switch off just the jingles (“Christmas jingles and Ho ho ho”), and “Christmas look: Off” turns off everything Christmassy: lights, snow, sounds, Christmas songs, the advent calendar and the Christmas bakery.',
  },
  'Adventskalender mit 24 Türchen': {
    title: 'An advent calendar with 24 doors',
    text: 'From December 1, Explore has an “Advent calendar” tile. Each day one more door opens, all the way to the big door 24. Behind each one something special is waiting: a Christmas song that plays on the radio with one tap (from “Last Christmas” to “White Christmas”), a recipe from Grandma’s Christmas bakery, a little story about Christmas back then or a question for your memory book. Knock too early and you learn how many days the door still needs. Opened doors stay open, and from January 1 to 6 all of them are open. With “Christmas look: on” in the settings you can peek behind all the doors ahead of time.',
  },
  'Weihnachtszeit: Omas Weihnachtsbäckerei und Weihnachtslook': {
    title: 'Christmas time: Grandma’s Christmas bakery and a Christmas look',
    text: 'From November 1 to January 6, Grandma’s Cookbook opens its Christmas bakery as the first ribbon: vanilla crescents, cinnamon stars, spritz cookies, coconut macaroons, baked apples and a kids’ Christmas punch. Before that, the ribbon shows how many days are left. During that time the whole time journey wears a Christmas look too: glowing fairy lights along the top, softly falling snow behind the pages and Christmas red as the accent color, in all three designs. The radio then plays Christmas songs on its own (Spotify’s “Christmas Hits” instead of the decade’s music), and the player says “Christmas songs”. In the settings you can switch the “Christmas look” on early or turn it off.',
  },
  'Omas Kochbuch: Leckereien von damals zum Nachkochen': {
    title: 'Grandma’s Cookbook: treats from back then to cook at home',
    text: 'Explore has a new category, “Grandma’s Cookbook”. It opens a recipe book with ribbons for the decades from the ’60s to the 2010s, your own era first. Every decade has two treats, from Hawaiian toast and chocolate biscuit cake to the cheese hedgehog, spaghetti ice cream, cheesecake crumble, muffins and cake pops. Each recipe comes with Grandma’s little story, ingredients you can tick off while you cook, the steps, Grandma’s tip and “Remember: who made this for you?” for your memory book.',
  },
  'Dein Jahr, deine Erinnerungen, dein Hit und deine Stube': {
    title: 'Your year, your memories, your hit and your living room',
    text: 'Under the huge year of the arrival show it now says what your year stands for, for example “1989 … the year of the fall of the Berlin Wall” (hand-picked for every year from 1945 to 2024); the same line stands under “Welcome to the year …” above every stop. At the lock-in a few seconds of the No. 1 hit of your year ring out as a fanfare (the No. 1 of the US year-end chart, with title and artist shown); the Spotify music pauses meanwhile. Your own memories now fly out with the decade’s things: your photos and the terms you have already collected. And after the landing the living room is furnished in the style of your decade: matching wallpaper, couch, cushions and curtains, plus a radio of the time on the window sill (tube radio, transistor, ghetto blaster, CD boombox, iPod dock, Bluetooth speaker, smart speaker); it moves in with a little animation, also in the room corners of the stations.',
  },
  'Ankunft mit Wow: Zeitanzeige, Blitz und dein Jahr': {
    title: 'An arrival with a wow: time circuits, a flash and your year',
    text: 'Coming out of the time machine into the app, a short show now plays. Time circuits like in the movies show the present in green and the destination in red; the red digits race, rattling, from today back to your birthday. Then they lock in: a bright flash, two shockwaves, a deep boom with a bright chord, and your birth year appears huge and glowing with “Welcome back” and the decade’s title, while things of that time (disco ball, cassette, joystick …) fly out of the middle. At that moment the robot voice says “Welcome back”. After a few seconds the show fades; a tap skips it. With reduced motion turned on in your system settings there is only the voice.',
  },
  'Zum Start nur „Welcome back“': {
    title: 'Only “Welcome back” at the start',
    text: 'Coming into the app through the time machine, the robot voice now only says “Welcome back”. The old dark voice that said “Welcome” after the app woke up is gone. The voice says “Welcome to the year …” only when you switch the decade in the settings; the sentence still stands in large print above every stop.',
  },
  '„Welcome to the year …“: Roboterstimme und Video aus deinem Jahr': {
    title: '“Welcome to the year …”: a robot voice and a video from your year',
    text: 'After every journey with the time machine, a robot voice says “Welcome to the year 1975” after a short beep. The year is your birth year or the decade you picked in the settings. Above every stop it says “Welcome to the year …” in large print, so you know where you are. Below it, after every journey, a year-in-review video from that year starts on its own from YouTube; you can hide it. YouTube only loads once you allow it (also in the settings under “Videos”). While the video plays, the Spotify music pauses. With the sound off, the voice stays quiet.',
  },
  'Musiksteuerung oben links, Feedback ganz unten': {
    title: 'Music controls top left, feedback at the bottom',
    text: 'At the top left of the time journey you now find back, play/pause and next as proper buttons, with the song that is playing in readable print next to them. Tap the title to open the full music controls. The tiny “Now playing” line in the corner is gone. The red Feedback button now sits at the bottom left under the accounts with “Sign out”: in Retro Warm in the accounts panel behind the person button, in the other designs once you scroll all the way down. In Retro Warm the accounts panel now sits above the bottom bar instead of half behind it.',
  },
  'Spotify Premium auf dem Handy: ganze Songs über deine Spotify-App': {
    title: 'Spotify Premium on your phone: full songs through your Spotify app',
    text: 'Signed in to the time journey with Spotify Premium, the music on your phone now plays full songs instead of 30-second previews. It plays in your own Spotify app on the phone; RetroMind only tells it which song comes next, and pause, next and back control it. The music player shows the device it plays on. If RetroMind can’t find the Spotify app, open it for a moment and tap “Try again” in the music player; until then you hear previews as before. If you were signed in already, sign in to Spotify once more (RetroMind needs one more permission). When you leave RetroMind, the music in the Spotify app stops.',
  },
  'Pause hält die Musik an, Hits aus deinen Jahren': {
    title: 'Pause stops the music, hits from your own years',
    text: 'The pause button in the music player now really stops the music. Before, Spotify could report a paused song as finished, and a new one started right away. Signed in with Spotify, the songs now also come from your own years: for every year of the decade in which you were 6 to 19, RetroMind looks for a hits playlist of that year and mixes the songs. The player then shows, for example, “Hits of 1983–1989”. Without a login the decade’s playlist plays as before.',
  },
  'Roter Faden: eine Zeitreise vom Willkommen bis zum Buch': {
    title: 'One thread: a time travel from the welcome to the book',
    text: 'The time journey now feels like one journey instead of separate pages. Pressing “Go back...” lets the time machine pull you in: the words and the clock spiral into the dial, rings of light rush to the centre, everything turns to light, and the light opens like an iris. The clock’s ticks race faster and faster, a hum and a rush of air swell, and the gong strikes as you arrive. You then enter your name and birthday on a ticket to your past, in the same dark clock room, instead of a bright form; “Set the clock” sends the hands racing backwards and opens the room onto the living room. Above every stop, in all designs, the same journey bar shows a little clock whose hand points to where you are (“Stop 4 of 7”, with “Explore › Music” when exploring), every stop to tap and the way back; while reading, a slim bar with arrows stays at the top. Every stop ends with “Next stop: …”, and every stop has one name everywhere (“Time Travel” and “Impressions” became “Your era”, the profile is now “Pack your suitcase”). One design system for spacing, edges, shadows, buttons and headings applies to all three designs. In Classic the tube haze is a little sharper, so text is easier to read.',
  },
  'Neu laden bleibt auf der Seite': {
    title: 'Reloading keeps your page',
    text: 'When you reload the page you land right where you were instead of on the welcome screen. In the time journey the open stage stays; in the gaming hall the hall, tab, filters, search and an open game stay. A new tab or a later visit still begins at the start.',
  },
  'Konten in den Einstellungen, Zahnrad schon im Startmenü': {
    title: 'Accounts in the settings, gear on the welcome screen',
    text: 'The optional Google and Spotify sign-ins now live in the settings under “Accounts (optional)”, where you can also sign out again. The two sign-in boxes on the start page are gone. The settings gear now already sits in the top-right corner of the welcome screen with the ticking clock, in every design.',
  },
  'Google-Anmeldung auf der Startseite, Einstellungen immer oben rechts': {
    title: 'Google sign-in on the start page, settings always top right',
    text: '“Sign in with Google” now sits on the start page right under the start button, in all three designs. Before, Classic and Night Shift only offered it at the very bottom of the page, and Retro Warm behind the account icon. The settings gear in Classic and Night Shift now stays fixed in the top-right corner while you scroll instead of only appearing at the bottom. In every design the settings can already be opened on the name form, for example to switch the language.',
  },
  'Kein Sprung nach oben beim Liedwechsel': {
    title: 'No more jumping to the top when the song changes',
    text: 'When the music moves on to the next song, open windows no longer jump back to the top. In the Zeitreise this happened in the settings and every other window (What’s new, feedback, rummage box, ticker info), in Gaming on the console shelf.',
  },
  'Helden deiner Jugend': {
    title: 'Heroes of your youth',
    text: 'Exploring has a new category, “Heroes of your youth”. The heroes of your decade hang there like posters on a bedroom wall, from Michael Knight and MacGyver to He-Man and Michael Jackson, and every other decade is one tap away. A search box finds any other hero: a name is enough, but so is a short description like “the guy with the talking car”. The search runs by itself as you type, and the AI works out who you mean. Every hero gets a page of their own with a fact sheet (Wikidata), the whole story from Wikipedia in chapters (English or German article) and, where a freely licensed one exists, a photo from Wikimedia Commons with its author and license. “Add my memory” puts the hero into your memory book with a personal question.',
  },
  'Die Stube in jeder Station': {
    title: 'The living room in every station',
    text: 'The living room no longer stops at the start page. Above every station of the journey there is now a corner of it of its own, in every design: an armchair by the coat rack for your profile, the old TV for the impressions, the record player on the sideboard for exploring, the writing desk with its green lamp for the diary, the bookshelf for the memory book, and a cake with a candle under a string of bunting for the wrap-up. The cat comes along everywhere and naps in a corner. In each corner there is something to tap, with a little sound: the TV changes channel, the record player drops the needle, the lamp switches on and off, a book slides out of the shelf, the candle gets blown out, the hat wobbles, and the cat purrs.',
  },
  'Die Stube zum Anfassen, in jedem Design': {
    title: 'A living room you can touch, in every design',
    text: 'The drawn living room now sits at the top of the start page in every design, Classic and Night Shift too (before, only Retro Warm had it). And everything in it can be tapped: the old tube TV with its test pattern in the corner starts the time travel (or continues it), the floor lamp clicks on and off, the wood stove can be lit and left to go out, the cat wakes up when you stroke it, purrs and sends up little hearts, and the window opens the real weather. Once you have started a journey, the picture on the wall takes you to your decades and the stack of books to your memory book. Every touch makes a little sound, and on a phone you feel a short buzz in your hand. While the stove burns, you can hear it crackle and pop softly (only with sound on). The potted plant has moved to the windowsill.',
  },
  'Mehr zu jedem Spruch im Laufband': {
    title: 'More about every saying in the ticker',
    text: 'Tap a saying in the ticker and a card opens with more about it, for example where “Don’t have a cow, man!” comes from or why people waited in line for gas on odd and even days. From there you can put it straight into the Grabbelkiste, and the Grabbelkiste shows the explanation too.',
  },
  'Echtes Wetter im Stubenfenster': {
    title: 'Real weather in the living-room window',
    text: 'Below the drawn living room you can now switch on “Show your real weather in the window”. Then it rains in the window when it rains where you are, it snows (with snow on the windowsill and white hills), lightning flashes in a thunderstorm, fog makes it hazy and clouds drift by. You either use your rough location or type in your town. The place is rounded to about 10 km and stays on your device, and our server gets the weather from the free weather service Open-Meteo. If you don’t switch it on, the window stays as before, and “Turn off” deletes the place again. The privacy policy has been updated.',
  },
  'Laufband mit Sprüchen von damals und Grabbelkiste': {
    title: 'A ticker of sayings from back then, and your Grabbelkiste',
    text: 'At the bottom of the start page a ticker now runs like the news crawl on an old TV, with sayings (“Groovy!”, “Gag me with a spoon!”) and everyday things from back then (“Rewinding the cassette with a pencil”). Your own decade shows up more often. Behind each one sits a floppy disk: tap it to put the saying in your Grabbelkiste (a rummage box), tap again to take it out. The box at the start of the ticker counts along and shows everything you collected when you tap it. The ticker moves slowly, stops while your finger or the mouse is on it, and has its own pause button. In the Retro Warm design it sits right above the bottom bar, in Classic and Night Shift at the end of the start page. If you turned motion off, you swipe through it yourself.',
  },
  'Holzofen in der Stube': {
    title: 'A wood stove in the living room',
    text: 'The drawn living room now has a cast-iron wood stove with a glass door, a kettle and firewood. In the evening and at night a fire flickers inside and bathes the room in warm light; by day only the embers glow. The floor lamp has moved a little closer to the couch to make room.',
  },
  'Gemütliche Stube': {
    title: 'A cozy living room',
    text: 'In the Retro Warm design, the time travel now feels like an evening on a warm couch. At the top of the start page sits a drawn living room: a caramel sofa with a crocheted blanket, a fringed floor lamp that glows softly, a steaming cup of tea and a cat asleep on the rug that twitches its tail now and then. Outside the window it’s the real time of day: the sun in the morning, the sunset in the evening, moon and stars at night, and in the evening the room gets dim and the lamp warmer. RetroMind also greets you by name to suit the hour (“Good evening, Marco. The lamp is on and the couch is warm.”). The background is a delicate wallpaper with warm lamplight from the corner, the cards are made of thick paper, and a wooden rail runs along the top and bottom. The texts are warmer too, like “Come on in, make yourself at home” on the name form. If you have turned off motion, the room stays still. The type stays large and easy to read.',
  },
  'Hallenmusik hört nie mehr auf': {
    title: 'The arcade music never stops',
    text: 'The music in the gaming hall could suddenly go quiet, for example when Spotify hung, an ad blocker slowed Spotify down, the browser didn’t let the next song start, or the phone put the sound to sleep when the screen locked. Now a watchdog keeps an eye on it: if Spotify stays silent for a few seconds, another song comes first, and if that doesn’t work either, the hall’s own music keeps playing right away. Every two minutes (or when you tap Next in the music player) the hall tries Spotify again. If the metal intro hangs, it moves on after a minute at the latest, and the sound wakes up by itself after you unlock your phone. Your own pause, the mute switch and “Music off” still count.',
  },
  'Zurück zur Zeitreise': {
    title: 'Back to the time travel',
    text: 'If you come to the gaming edition through the signpost or the settings of the time travel, you now see a clearly visible “Back to RetroMind” button in the top left, at the door and in the hall. It stays for your whole visit, even after a reload, and takes your sound and Google settings back with you.',
  },
  'Gaming-Edition: Fakten & Geheimnisse zu jedem Spiel': {
    title: 'Facts & secrets for every game',
    text: 'Every game page has a new “Facts & secrets” tab. It has a fact sheet (who developed, designed and scored the game, when it came out on which platform, series, predecessor and sequel, awards, sales, age ratings), the review scores from back then, the whole Wikipedia article in chapters with the stories behind the game (development, music, controversies, versions) at the top. On top come direct links to the matching game databases, such as The Cutting Room Floor, where fans collect cut levels and hidden messages. Everything comes from freely licensed sources (Wikidata and Wikipedia) and is shown with its source and license. The “Screenshots” tab now only shows freely licensed images from Wikimedia Commons, no more protected screenshots or box art.',
  },
  'Ramponierter Wegweiser': {
    title: 'Battle-worn signpost',
    text: 'The signpost to the gaming zone now looks like it has seen a few battles: frayed edges, blade cuts in the wood, a charred arrow tip with glowing embers and scorch marks. The dark outline around the metal letters has chipped off in many places.',
  },
  'Musik-Schalter, sanfterer Einstieg, „Deine Zeit“ und Buch-Fortschritt': {
    title: 'Music switch, a softer start, “Your era” and book progress',
    text: 'The question about music from Spotify is now a switch right on the welcome screen. If you leave it alone, you are asked after the name form instead of in the middle of it. Above the name form the mantel clock floats in, small, so the change from the dark clock room feels less abrupt. Before the journey starts, the start page shows your own decade with things from back then and three postcards to open. And a bar shows how full your memory book is: every answered question is a page, the diary is one more, and ten pages are the first goal.',
  },
  'Wegweiser im God-of-War-Stil': {
    title: 'Signpost in God of War style',
    text: 'The wooden signpost to the gaming zone now says “To the gaming zone” in chiseled, Greek-looking capitals of brushed metal, inspired by the God of War logo. The font is freely licensed (Cinzel) and comes straight from RetroMind, not from someone else’s server.',
  },
  'Feinschliff nach dem Grok-Test': {
    title: 'Polish after the Grok test',
    text: 'On narrow phones the top bar fits on the screen again: the buttons are a little smaller and the feedback button shows only the word there. The decades on the start page sit as six equal buttons in two tidy rows, with “your era” in small print below. Instead of a puzzling red dot, the gear now says “New” when there is something to read under “What’s new”. Orange buttons with white text are a little darker and so easier to read. And when you tap the welcome screen to hear the clock, a bouncing speaker and “the clock is running” appear, even if your phone is on silent.',
  },
  'Gaming-Edition: Eigene Pixelbilder für jedes Spiel': {
    title: 'Our own pixel pictures for every game',
    text: 'Instead of the little pixel monster, every game card now shows a whole pixel picture. The 44 games in the catalog each have a hand-drawn scene of their world, like an airship between floating islands or a country road at sunset. Real covers, famous characters and logos are deliberately left out, because they belong to the game companies. Every other game from the archive and search gets a fitting picture automatically: racing games a road, space games stars and planets, dragon games a castle and so on, a little different for every game. In the hall the card shows only the picture, because the title is already on the label.',
  },
  'Videos passen zum richtigen Spiel': {
    title: 'Videos match the right game',
    text: 'In the Gaming edition’s “Videos” tab (and in Music & TV ads), games with sequels often played clips of the wrong part, for Fallout (1997) for example Fallout 4. The search now includes the release year, and videos about sequels like “Fallout 4” or “Fallout 76” are sorted out. Videos with the game’s name in the title come first.',
  },
  'Eigene Pixel-Kacheln statt Spiele-Cover': {
    title: 'Our own pixel tiles instead of game covers',
    text: 'The game cards in the Gaming edition no longer show cover photos from Wikipedia, because those pictures belong to the game companies. Instead the app draws its own pixel tile for every game: a little pixel monster in the console’s color, with the title and year underneath. Every game always gets the same figure. The tiles appear on the cards, on the game page, on the cartridge when it goes in and in attract mode. The “Name that game” quiz now shows a short description with platform and year (the name blacked out) instead of a close-up of the cover.',
  },
  'Datenschutzerklärung auf dem neuesten Stand': {
    title: 'Privacy policy brought up to date',
    text: 'It now also explains the shared high score table (only the game, three letters and the score are stored) and that with Spotify Premium your browser loads Spotify’s player.',
  },
  'Postanschrift im Impressum': {
    title: 'Postal address in the legal notice',
    text: 'The legal notice of Time Travel and the Gaming edition now lists a postal address (c/o Block Services in Fellbach), as German law requires. Marco’s home address stays private.',
  },
  'Neues Eingangsbild ohne fremde Logos': {
    title: 'A new entrance picture without other brands’ logos',
    text: 'Marco’s new picture now hangs outside the arcade hall. Instead of Nintendo, SEGA and Atari logos and well-known game characters like Pac-Man or Mario, the door and pillars show our own pixel symbols like a spaceship, a planet, a UFO, a joystick and hearts. The glowing ARCADE letters and the blinking door frame work just like before.',
  },
  'Der Retro-Guru antwortet wieder': {
    title: 'The Retro Guru talks again',
    text: 'In the gaming edition, the Guru and the other AI features only said “Lag! Connection lost”, because Google switched off the AI model we used for new keys. The app now always uses Google’s current model and switches to another one on its own if one goes away.',
  },
  'Leiser reinkommen und Lautstärke-Regler': {
    title: 'A quieter entrance and a volume slider',
    text: 'The music was far too loud when you walked into the arcade hall. It now starts at half volume, and the door bang is a bit softer. The music player has a slider for louder and quieter, and in the gaming edition there’s one in the settings too, under “Music volume”. It works for the metal intro, the chiptune tracks and Spotify with Premium on a computer. No website can turn down Spotify’s embedded player (without signing in, and on phones); use your device’s volume buttons there, and the player tells you so.',
  },
  'Modul einlegen, diesmal richtig': {
    title: 'Inserting the cartridge, done right',
    text: 'Opening a game looked off: the cartridge fell past the console and showed up below it. Now the cartridge floats in with its cover, lines up over the slot and gets pushed in: it scrapes going in, lands with a full, deep thunk and snaps into place with a crisp click. The console jolts, the red light comes on, the switch flips, and the TV turns on with a white line that opens into the game page. Tap to skip.',
  },
  'Modul einlegen, Highscore-Tafel, neue Automaten-Spiele und die Urzeit': {
    title: 'Insert the cartridge, a high score table, new arcade games and the stone age',
    text: 'Tap a game card and the cartridge slides into a console slot before the game page “boots”; there you swipe to the next game. Achievements pop up like on a console, as a round trophy bar with a “bloop”. You can drag the coin into the slot by hand, the cabinets blink behind the catalog, and after a minute without input the attract mode runs covers with a blinking INSERT COIN. New in the chill zone: Breakout, Snake, a space invasion and the “Name that game” quiz with coins as the reward. After a good round you put your three initials on the shared high score table. Every day the hall shows “Today X years ago”, a game released on that date. Next to the stash there’s a “Had it back then” shelf for the games and consoles of your childhood, and the ’70s with Pong, Space Invaders and co. are in as the stone age.',
  },
  'Cover auf den Karten, aufgeräumte Halle, Soundtrack und alte Testwertungen': {
    title: 'Box art on the cards, a tidy hall, soundtracks and old magazine scores',
    text: 'Every game card in the gaming hall now shows the game’s box art, and on phones two cards sit side by side. Up top there’s just the search and “Insert Coin”, with a swipeable row of decades and the console picker below, so the games show up right away. Catalog, systems, stash, trophies, chill zone and quests live in the bar at the bottom in every design; music, sound effects and colors are in the settings. One SCORE replaces 1UP and HI-SCORE, and “ONLY HERE” next to the coins is easy to read. Descriptions use a readable font and no longer stop mid-word. On phones you feel a short buzz when you drop a coin, at the door and for achievements. The game page has a new “Music & TV ads” tab with the soundtrack and the old TV spots, and a “Magazines & today” tab: scores from EGM, Power Play and co., where to play it legally today and level passwords, with sources. Plus links to manuals and Kultboy.',
  },
  'Pac-Man läuft unter den Knöpfen durch': {
    title: 'Pac-Man runs underneath the buttons',
    text: 'The little Pac-Man and his ghost wandering through the gaming hall now run behind all buttons, cards and windows instead of over them. In return he’s a bit easier to see on the open background.',
  },
  'Blinkender Leuchtrahmen um die Tür': {
    title: 'Blinking neon frame around the door',
    text: 'The ENTRANCE door outside the gaming hall now has a thick, warm yellow neon frame that blinks and flickers like an arcade sign. You see right away where to go in.',
  },
  'Rein geht es jetzt durch die Tür': {
    title: 'You now go in through the door',
    text: 'There’s no ENTER button outside the gaming hall anymore. Just tap the ENTRANCE door in the picture; its edges glow softly so you know. The “Warning, extreme loud!” sign now stands in the middle below the picture, with the speaker to its right.',
  },
  'Neuer Eingang zur Gaming-Halle mit leuchtendem ARCADE-Schild': {
    title: 'New entrance to the gaming hall with a glowing ARCADE sign',
    text: 'Outside the door there’s now Marco’s new picture: a run-down arcade with a sticker-covered ENTRANCE door in the rain. The ARCADE neon sign lights up letter by letter, one more every second; a second after all six are on, everything goes dark and it starts over. ENTER swings the new door open. On a computer the picture stands at full height in the middle, with a blurred copy filling the sides. The old “Arcade Hallen” with the wobbling bulb has moved to the archive.',
  },
  'Easter-Egg-Meldung bleibt länger stehen': {
    title: 'Easter egg message stays up longer',
    text: 'When you find an Easter egg or a badge in the gaming hall, the message now stays up for 12 seconds instead of barely 4, so you can read it in peace. The “×” in the top right closes it sooner.',
  },
  'Club wieder verlassen': {
    title: 'Leave the club',
    text: 'In the gaming hall there’s now a door button in the top bar next to sound and settings. It takes you back outside the door, where the music comes muffled through the wall again; ENTER takes you back in.',
  },
  'Vor der Gaming-Halle wieder dumpf und bassig, mit dem Song von drinnen': {
    title: 'Muffled and bassy outside the gaming hall again, with the song from inside',
    text: 'If you’re signed in with Spotify Premium, the music in front of the door sounds muffled and bassy again, as if through the wall, but now it’s exactly the song playing inside. Outside you hear a clip of the song, and inside Spotify then plays it in full, on phones too. If there’s no clip for a song, you hear the muffled metal from the hall outside, as before.',
  },
  'Spotify-Musik schon vor der Gaming-Halle, auch am Handy': {
    title: 'Spotify music outside the gaming hall, on phones too',
    text: 'If you’re signed in with Spotify Premium, you now hear the hall music in front of the door on your phone too, and when you walk in the same song simply keeps playing, with no metal intro in between. Until now this only worked in a desktop browser. On phones the music plays at normal volume outside, because Spotify’s player there can’t be turned down.',
  },
  'Versionsnummer in den Einstellungen': {
    title: 'Version number in the settings',
    text: 'At the very bottom of the settings in both apps you can now see which version is running, for example “Version 2.167 (a1b2c3d)”. The number after the dot goes up with every change, and the code in parentheses shows exactly which build is loaded.',
  },
  'RetroMind spricht jetzt Englisch': {
    title: 'RetroMind now speaks English',
    text: 'Both apps, Time Travel and RetroMind – Gaming, have been fully translated into American English, and English is the new default language. If you prefer German, switch to “Deutsch” under “Language” in the settings; your choice is saved in your browser. Everything the AI writes (questions, photo analysis, chat, Retro Guru, game guides) also comes in the language you picked. The game tokens are now called “Coins”. The privacy policy and legal notice are now also available in English.',
  },
  'Anmelden schon am Eingang der Gaming-Halle': {
    title: 'Sign in right at the gaming hall entrance',
    text: 'Below the ENTER button there are now two optional buttons: “Sign in with Google” (saves your progress and coins on all your devices) and “Connect Spotify” (hall music in full length, gently louder with Premium). No more detour through the settings. If you’re already signed in, you just see a small check mark with your name.',
  },
  'Easter Eggs in der Gaming-Halle': {
    title: 'Easter eggs in the gaming hall',
    text: 'Ten secrets are now hidden in the hall, for example old cheats in the search (IDDQD, Rosebud, XYZZY), a Pac-Man to catch, tapping the logo five times, or asking the Guru about the meaning of life. Every egg you find pays out coins once, the same ones you get for quests. Under “Quests” you’ll find a list with hints for everything you’re still missing. The prize counter now has a rainbow-colored “Party Logo”. Your coin balance sits in the header as before. If you’re not signed in with Google, it says “ONLY HERE” and “Quests” shows a clear note: your coins are then only saved on this device. Once you sign in, coins and found eggs go into your Google backup too.',
  },
  'Mehr im Adminbereich': {
    title: 'More in the admin area',
    text: 'The admin area now has three tabs. “Usage” also shows devices (phone, tablet, computer), how often the app is opened as an installed app, and the most popular decades, games and mini-games, for this month and overall. “Feedback” lists all feedback; open items can be turned into a to-do or checked off as done right there. The “Live Check” shows whether both domains really serve the newest version and otherwise links to the redeploy in Vercel. Everything stays anonymous; the privacy policy has been updated.',
  },
  'Versteckter Zugang zum Adminbereich': {
    title: 'Hidden way into the admin area',
    text: 'Quickly tapping the “Settings” heading five times in the settings of Time Travel or Gaming takes you to the admin area. Nothing about it is visible, and only Marco’s Google account can see any numbers there. This also works in the installed app, which has no address bar.',
  },
  'Kein Admin-Link mehr in den Apps': {
    title: 'No more admin link in the apps',
    text: 'The link to the admin area is gone from the settings of Time Travel and Gaming. The area can now only be reached directly at /admin/.',
  },
  'Adminbereich mit Nutzungszahlen': {
    title: 'Admin area with usage numbers',
    text: 'At /admin/ there’s now an area just for Marco. It shows how many people opened Time Travel and Gaming: visitors today, visits over the last 7, 30 or 90 days, and all app launches, as bars and a table. Only Marco’s Google account gets in, and the server checks that. The link sits in the settings of both apps and is only visible to him. Counting is anonymous, without cookies and without storing IP addresses; a new section of the privacy policy explains this.',
  },
  'Metal-Intro auch mit Spotify, Premium schon vor der Tür': {
    title: 'Metal intro with Spotify too, Premium already outside the door',
    text: 'The new metal intro now also plays when you enter the gaming hall if Spotify is the hall music; Spotify takes over afterwards. If you’re signed in to Gaming with Spotify Premium (browser on a computer), you already hear the same Spotify music quietly outside the door, and it gets loud as you walk in. Without Premium, the muffled intro keeps playing outside the door.',
  },
  'Besser klingende Metal-Musik in Gaming': {
    title: 'Better-sounding metal music in Gaming',
    text: 'The metal intro when you walk in and the muffled bass outside the door now sound like a real band: two distorted guitars left and right, a bass, a solo with echo, fuller drums with crashing cymbals, and reverb like in a big hall. The music is no longer generated live on your phone but pre-recorded. That means nothing stutters, and outside the door you hear exactly the same music, just muffled by the wall.',
  },
  'Vor dem Eingang nur noch der Bass aus der Halle': {
    title: 'Only the bass from the hall outside the entrance',
    text: 'Street noise, sirens and the crowd outside the gaming hall are gone, because several sounds at once caused problems. Outside the door you now only hear the bass and drums of the metal music inside, muffled by the wall and slowly getting louder.',
  },
  'Bass aus der Halle schon vor dem Eingang': {
    title: 'Bass from the hall already outside the entrance',
    text: 'Outside the gaming hall you now hear metal playing inside, muffled by the wall: kick drum, snare and the bass line of exactly the riff that gets loud when you walk in. That way you know outside already that it’s going to be loud in there. It sits quietly under the street sounds and slowly gets louder along with them.',
  },
  'Metal-Intro in der Halle am Handy hörbar': {
    title: 'Metal intro in the hall now audible on phones',
    text: 'On phones, all you heard of the metal intro when entering the gaming hall was a faint bass hum. Guitar and kick drum now sit at pitches phone speakers can play: the guitar is punchier, the kick drum snappier and less deep, and it no longer pushes everything else down. The intro still fades in slowly.',
  },
  'Warnschild vergräbt sich bei Ton aus': {
    title: 'Warning sign buries itself when the sound is off',
    text: 'If you turn the sound off on the Time Travel start page or at the Gaming entrance, the “Warning, extreme loud!” sign wobbles briefly and then sinks into the ground. Only the little mound of dirt is left. Turn the sound back on and it pops right back up.',
  },
  'Wegweiser „To the gaming zone“': {
    title: 'Signpost “To the gaming zone”',
    text: 'The Time Travel start page now has a wooden signpost reading “To the gaming zone” in every design. Clicking it takes you to RetroMind – Gaming; your sound and Google settings come along. The signpost replaces the old dark button “New: RetroMind – Gaming”. The link to Gaming in the settings stays as before.',
  },
  'Ton beim Öffnen leise, mit Warnschild': {
    title: 'Quiet sound on opening, with a warning sign',
    text: 'Opening Time Travel or Gaming no longer blasts you with sound right away. The ticking clock and the gong in Time Travel, as well as the street, door and metal intro in Gaming, start quietly and slowly get louder over about 10 seconds. That leaves time to turn the sound off. While the sound is on, a wooden sign is hammered into the ground to the right of the start button (“Go back...” or “ENTER”): “Warning, extreme loud!”. With Spotify Premium on a computer, the music fades in slowly too. The regular Spotify player can’t start more quietly, but it only begins after the start button.',
  },
  'Gaming startet im dunklen Design': {
    title: 'Gaming starts in the dark design',
    text: 'The Gaming edition now opens in the dark arcade design by default instead of the light module design. If you’ve used Gaming before, you get the dark design once automatically. If you then pick another design under “Screen” in the settings (for example module again), it sticks.',
  },
  'Stationen direkt unter dem Logo wählen': {
    title: 'Pick stops right below the logo',
    text: 'In the Classic and Night Shift designs, the journey now shows “Stop x of 7” with the name of the current stop under the small logo. It stays folded up until you tap it. Then you see all stops from Start to Wrap-Up and jump straight to one with a tap, without going back to the start page first. The Retro Warm design already has this in its stepper.',
  },
  'Feedback-Knopf ist jetzt rot und beschriftet': {
    title: 'The feedback button is now red and labeled',
    text: 'Feedback used to be just a small envelope icon that many people missed. Now it’s a red button labeled “Feedback”, in every Time Travel design and in the Gaming edition (there below the sound and gear buttons). In the Classic and Night Shift designs it sits in the top left on phones so it doesn’t cover the logo. So that everything fits in the Retro Warm header on phones, the “RETROMIND” lettering is dropped on narrow screens (the logo stays) and the sound switch only shows its icon.',
  },
  'Gaming: Pac-Mampf in der Chill-Ecke': {
    title: 'Gaming: Pac-Munch in the chill corner',
    text: 'A new mini-game in the style of Pac-Man, with its own maze and its own graphics. Gobble up dots, dodge the four ghosts, and after a power pellet they turn blue and can be eaten. Plus a tunnel at the side, a cherry as a bonus, and every level gets a little faster. On phones you steer by swiping across the maze or with the D-pad below it, on computers with the arrow keys (or WASD); the space bar pauses. A cleared level counts as a completed mini-game for quests and achievements, and your high score is saved.',
  },
  '„Deine Zeit“ passt jetzt zum Geburtsjahr': {
    title: '“Your time” now matches your birth year',
    text: 'The intro used to say things like “In the 2010s you were about elementary school age”, even if you were born in 2010. That sounded contradictory and was also wrong for very young or very old birth years. Now it shows your birth year and roughly when you were in elementary school, e.g. “You were born in 2010, so you were in elementary school from about 2016 to 2020”. If your elementary school years fall in a decade RetroMind doesn’t have yet, the app says so and starts with the closest one.',
  },
  'Spotify-Musik auf Android wieder sofort da': {
    title: 'Spotify music on Android plays right away again',
    text: 'When signed in with Spotify Premium, Android phones stayed silent because Spotify’s browser player doesn’t play there. On phones and tablets the music now plays through the embedded Spotify player, just like without signing in. Search and theme music still work there; the volume slider and the slow fade-in are only available on computers.',
  },
  'Musik kommt auch, wenn Spotifys Browser-Player streikt': {
    title: 'Music plays even when Spotify’s browser player acts up',
    text: 'When signed in with Spotify Premium, sometimes no music played at all. RetroMind now tries to start several times, and if still no song plays, the music continues through the embedded Spotify player like before you signed in. Search and theme music stay usable.',
  },
  'Spotify-Player: Suche, Musik zum Thema und mehr': {
    title: 'Spotify player: search, theme music and more',
    text: 'When you’re signed in to Spotify, the music player in Time Travel and the gaming hall can do a lot more. Search for songs, albums and artists and play them with a tap. A bar shows where you are in the song, and you can jump around in it. With Premium you also get a volume slider, the album cover, and previous/next within albums. “Theme music” (on, can be switched off) plays fitting music on its own: open a music topic in Time Travel like “ABBA fever” or “NDW” and the matching hit plays. Open a game in Gaming and its soundtrack plays, if Spotify has one. When you close it, the regular music continues, and “Back to …” brings it back anytime. Without signing in, the player shows a button to sign in.',
  },
  'Gaming: Pac-Man wandert frei durch die Halle': {
    title: 'Gaming: Pac-Man roams freely through the hall',
    text: 'Instead of just running along the bottom of the screen, the little Pac-Man now keeps picking a random spot anywhere on the screen and slowly heads there, straight or diagonally. Along the way he eats a row of dots, and the ghost follows his trail. He’s even more see-through than before, can’t be tapped, and is off when “Reduce motion” is turned on on your device.',
  },
  'Gaming: Pac-Man jetzt sichtbar': {
    title: 'Gaming: Pac-Man now visible',
    text: 'The little Pac-Man from PR #141 ran behind the cards in the hall, so on phones you couldn’t see him at all. Now he runs semi-transparent across the catalog, but below the bottom bar, the buttons and windows. Taps still go right through him.',
  },
  'Spotify Premium: Musik wird langsam lauter': {
    title: 'Spotify Premium: music fades in slowly',
    text: 'If you sign in with Spotify Premium, you hear the music in Time Travel and the gaming hall through Spotify’s own browser player. It starts quietly and gets louder over about 6 seconds when it starts and resumes, and full songs play instead of short previews. In the Gaming edition there’s a “Sign in with Spotify” button for this under “Hall music” in the settings. Without Premium and on iPhone/iPad everything stays as before.',
  },
  'Gaming: kleiner Pac-Man im Hintergrund': {
    title: 'Gaming: little Pac-Man in the background',
    text: 'In the RetroMind - Gaming hall, a small, faded Pac-Man now slowly runs along the bottom of the screen, eats a row of dots and has a ghost on his heels. He stays behind the catalog and buttons, can’t be tapped, and is off when “Reduce motion” is turned on on your device.',
  },
  'Gaming: Hallenmusik wird langsam lauter': {
    title: 'Gaming: hall music fades in slowly',
    text: 'The self-generated music in RetroMind - Gaming (the metal intro after walking in and the chiptune tracks) now starts quietly and gets louder over about 6 seconds, also when you switch it back on. The Spotify music still starts at normal volume, because Spotify’s embedded player offers no volume control.',
  },
  'Zeitreise: Überschrift nicht mehr über offenen Fenstern': {
    title: 'The headline no longer shows over open windows',
    text: 'The “RetroMind” lettering used to shine through the settings, feedback and other windows. Open windows now sit cleanly on top.',
  },
  'Zeitreise: Knopf zurück zur Startseite': {
    title: 'A button back to the start page',
    text: 'A house icon at the bottom center takes you back to the start from every page of the journey, without losing your progress.',
  },
  'Zeitreise: Feedback geben': {
    title: 'Send feedback',
    text: 'The settings have a “Send feedback” button for praise, criticism, suggestions and wishes. The message reaches Marco by email.',
  },
  'Zeitreise: Nostalgie-Radio entfernt': {
    title: 'Nostalgia radio removed',
    text: 'The self-generated background music in the settings is gone. Picking a decade now only steers the real hits from Spotify.',
  },
  'Zeitreise: Ticken auf dem Willkommensbildschirm, wieder entfernt': {
    title: 'Ticking on the welcome screen, taken out again',
    text: 'A soft ticking of the clock was added, but it did not play reliably and got in the way of the music starting. So it was taken out again (it later came back, improved).',
  },
  'Zeitreise: Anmeldung beim Öffnen': {
    title: 'Sign-in on opening',
    text: 'Before the journey a check asked for a Google sign-in (without Google a small form). Name and date of birth came from the Google profile. Later the sign-in became optional again.',
  },
  'Zeitreise: Willkommensbildschirm mit Kaminuhr': {
    title: 'Welcome screen with a mantel clock',
    text: 'Before the app, “Welcome to RetroMind” appears with the line “The ticket to your past”. Behind it, large and seen at an angle from above, stands an old wooden mantel clock whose hands move slowly. The screen is dark and mysterious, the title is set in an ornate font, glows and floats gently. Pressing “Let’s go!” sets off a shower of sparks, then the screen slowly fades into the app.',
  },
  'Zeitreise: Hinweis zum Spotify-Login': {
    title: 'A note about the Spotify login',
    text: 'Next to the Spotify player a note explains that Spotify has its own sign-in. Without it the player only plays 30-second previews, even if you are signed in with Google.',
  },
  'Zeitreise: Einstellungen und Google-Knopf erst ganz unten': {
    title: 'Settings and Google button at the very bottom',
    text: 'The gear and the Google button sit in the two bottom corners and only appear once you scroll to the end of the page.',
  },
  'Zeitreise: „Weitermachen“ gleich oben': {
    title: '“Continue” right at the top',
    text: 'When you come back, you see “Continue” and “Start over” right under the heading instead of far down the page.',
  },
  'Zeitreise: Google-Anmeldung klappt am Handy beim ersten Tipp': {
    title: 'Google sign-in works on the first tap on phones',
    text: 'Google’s sign-in window now opens right away; before, the phone swallowed the first tap.',
  },
  'Zeitreise: ruhige Melodie zum Start': {
    title: 'A calm melody at the start',
    text: 'Instead of a steady droning tone, a short, calm melody plays in a loop, in a different key for every decade.',
  },
  'Zeitreise: klare Überschrift mit rotem R und M': {
    title: 'A crisp headline with a red R and M',
    text: '“RetroMind” is no longer blurry, and the R and M are red.',
  },
  'Zeitreise: Versionsnummer in den Einstellungen': {
    title: 'Version number in the settings',
    text: 'At the bottom of the settings you can read which version is running, in an easy-to-read size.',
  },
  'Zeitreise: Einstellungen mit Zahnrad': {
    title: 'Settings behind a gear',
    text: 'A gear opens the settings with font size and music (play, decade, volume). The separate music button is gone.',
  },
  'Zeitreise: Musik von Anfang an': {
    title: 'Music from the start',
    text: 'Calm background music starts in a loop when you open the app. If the browser blocks the sound, it says “Tap to start”. The music is made inside the app instead of being loaded from another site that sometimes stayed silent.',
  },
  'Zeitreise: Startknopf direkt unter der Überschrift': {
    title: 'Start button right under the heading',
    text: '“Start time travel” now sits right at the top of the start page.',
  },
  'Zeitreise: Röhrenbildschirm-Look für die ganze App': {
    title: 'A tube-TV look for the whole app',
    text: 'Fine stripes and a light haze like on an old TV lie over the whole app, flickering now and then.',
  },
  'Zeitreise: Radio-Player als kleiner runder Knopf': {
    title: 'The radio player as a small round button',
    text: 'The music player starts as a round button at the bottom right and opens and closes when you tap it.',
  },
  'Zeitreise: Fotos wie alte Abzüge': {
    title: 'Photos like old prints',
    text: 'All pictures look slightly faded and sepia-toned and flicker now and then like on an old screen. The printed book stays clear.',
  },
  'Zeitreise: Start mit Pixel-Effekt und „Welcome“': {
    title: 'A pixel effect and “Welcome” at the start',
    text: 'When the app opens, a black grid dissolves square by square to a deep tone. Then a deep, slow voice says “Welcome”.',
  },
  'Zeitreise: jeder Knopf reagiert': {
    title: 'Every button responds',
    text: 'Small buttons like Close or Later now also give visible and audible feedback when pressed.',
  },
};

const cleanText = (s: string) =>
  s
    // a parenthesis holding only a file path is meaningless in the app
    .replace(/\s*\(`[^`]*`(?:,\s*[^)]*)?\)/g, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

const parseEntry = (raw: string, index: number): WhatsNewEntry | null => {
  const body = raw.replace(/^-\s*/, '').replace(/\n\s*/g, ' ').trim();
  const bold = body.match(/^\*\*(.+?)\*\*\s*(.*)$/);
  let title = bold ? bold[1].trim() : '';
  const english = bold ? EN[title] : undefined;
  let rest = bold ? bold[2] : body;

  if (HIDDEN_TITLES.test(title)) return null;

  // "(2026-10-03, PR #81): …" right after the title
  let date: string | undefined;
  const meta = rest.match(/^\(([^)]*)\)\s*:?\s*/);
  if (meta) {
    date = meta[1].match(/\d{4}-\d{2}-\d{2}/)?.[0];
    rest = rest.slice(meta[0].length);
  }
  rest = rest.replace(/^:\s*/, '');
  title = title.replace(/:$/, '').trim();

  let module: string | undefined;
  const prefix = MODULES.find((m) => title.startsWith(`${m}:`));
  if (prefix) {
    module = prefix;
    title = title.slice(prefix.length + 1).trim();
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }

  const text = cleanText(rest);
  if (!title && !text) return null;
  const id = `${index}:${title || text.slice(0, 40)}`;
  if (isGerman) return { id, module, title: cleanText(title), date, text };
  if (english) return { id, module, title: english.title, date, text: english.text };
  return { id, module, title: cleanText(title), date, text, germanOnly: true };
};

export const parseChangelog = (md: string): WhatsNewSection[] => {
  const sections: WhatsNewSection[] = [];
  let current: WhatsNewSection | null = null;
  let entry: string[] | null = null;
  let index = 0;

  const flush = () => {
    if (current && entry) {
      // hidden entries take no index, so the newest visible id stays stable
      const parsed = parseEntry(entry.join('\n'), index);
      if (parsed) {
        current.entries.push(parsed);
        index++;
      }
    }
    entry = null;
  };

  for (const line of md.split('\n')) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      flush();
      current = { version: heading[1].trim(), entries: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    if (line.startsWith('- ')) {
      flush();
      entry = [line];
    } else if (entry && /^\s+\S/.test(line)) {
      entry.push(line);
    } else {
      // blank line, sub-heading or free paragraph ends the entry
      flush();
    }
  }
  flush();
  return sections.filter((s) => s.entries.length);
};

export const WHATS_NEW: WhatsNewSection[] = parseChangelog(changelog);

const newestId = () => WHATS_NEW[0]?.entries[0]?.id ?? '';

/** True while the newest entry hasn't been seen on this device yet. */
export const hasUnseenNews = (): boolean => {
  try {
    const seen = localStorage.getItem(SEEN_KEY);
    return !!newestId() && seen !== newestId();
  } catch {
    return false;
  }
};

export const markNewsSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, newestId());
  } catch {
    /* storage unavailable: the dot just shows again next time */
  }
};

/** Titles of entries logged after the given day (YYYY-MM-DD), newest first, for the "since your last visit" letter. */
export const newsSince = (day: string, max = 4): string[] =>
  WHATS_NEW.flatMap((s) => s.entries)
    .filter((e) => e.date && e.date > day)
    .slice(0, max)
    .map((e) => e.title);
