// Real-world foley generated with Higgsfield Seed Audio 1.0.
// mode 'single' keeps only the loudest event; 'all' keeps the whole gesture.

const STYLE = 'isolated foley sound effect, close mic, dry studio recording, no background noise, no music, no voice, no speech';
const f = (id, name, category, tags, description, mode, what) => ({
  id, name, category, tags, description, source: 'seed-audio', mode, prompt: `${what}, ${STYLE}`,
});

export const seedPrompts = [
  // Keyboard and desk
  f('key-mechanical', 'Mechanical key', 'keyboard', ['key', 'keyboard', 'mechanical', 'thock', 'press', 'typing'], 'One press on a mechanical keyboard.', 'single', 'A single crisp mechanical keyboard key press'),
  f('key-laptop', 'Laptop key', 'keyboard', ['key', 'keyboard', 'laptop', 'scissor', 'quiet', 'press'], 'One soft press on a laptop keyboard.', 'single', 'One single key press on a MacBook laptop keyboard, a soft short plastic tap, nothing before or after it'),
  f('typing-mechanical', 'Mechanical typing', 'keyboard', ['typing', 'keyboard', 'mechanical', 'burst', 'writing'], 'A short burst of fast mechanical typing.', 'all', 'A short one-second burst of fast typing on a mechanical keyboard'),
  f('typing-laptop', 'Laptop typing', 'keyboard', ['typing', 'keyboard', 'laptop', 'soft', 'burst'], 'A short burst of soft laptop typing.', 'all', 'A short one-second burst of fast typing on a quiet laptop keyboard'),
  f('spacebar', 'Spacebar', 'keyboard', ['spacebar', 'key', 'keyboard', 'thump', 'press'], 'A spacebar press with its stabilizer rattle.', 'single', 'A single spacebar press on a mechanical keyboard, slightly hollow with a stabilizer rattle'),
  f('mouse-click', 'Mouse click', 'keyboard', ['mouse', 'click', 'computer', 'button', 'press'], 'A real computer mouse button click.', 'single', 'A single computer mouse left button click'),
  f('pen-click', 'Pen click', 'keyboard', ['pen', 'click', 'ballpoint', 'retract', 'desk'], 'A ballpoint pen clicking.', 'single', 'A single ballpoint pen click'),
  f('stapler', 'Stapler', 'keyboard', ['stapler', 'staple', 'office', 'punch', 'desk'], 'A desk stapler punching through paper.', 'single', 'A single desk stapler pressed down, stapling paper'),

  // Paper
  f('paper-crumple', 'Paper crumple', 'paper', ['paper', 'crumple', 'discard', 'trash', 'delete'], 'A sheet of paper crumpled into a ball.', 'all', 'A sheet of paper being crumpled into a ball, short'),
  f('page-turn', 'Page turn', 'paper', ['page', 'turn', 'book', 'paper', 'flip', 'next'], 'A single book page turning.', 'all', 'A single book page being turned'),
  f('paper-tear', 'Paper tear', 'paper', ['paper', 'tear', 'rip', 'remove', 'cut'], 'A quick tear of a paper strip.', 'all', 'A short quick tear of a strip of paper'),
  f('paper-slide', 'Paper slide', 'paper', ['paper', 'slide', 'desk', 'swipe', 'move'], 'A sheet of paper sliding across a desk.', 'all', 'One sheet of printer paper pushed quickly across a smooth desk, a short soft papery swish lasting half a second'),
  f('trash-bin', 'Into the bin', 'paper', ['trash', 'bin', 'delete', 'discard', 'empty', 'paper'], 'A paper ball dropped into a metal bin.', 'all', 'A crumpled paper ball dropped into an empty metal trash bin'),
  f('envelope-open', 'Envelope open', 'paper', ['envelope', 'open', 'mail', 'letter', 'inbox', 'tear'], 'A paper envelope being torn open.', 'all', 'A paper envelope being torn open, short'),
  f('card-flip', 'Card flip', 'paper', ['card', 'flip', 'playing card', 'reveal', 'deal'], 'A playing card flipped onto a table.', 'single', 'One playing card flicked face-up and slapped flat onto a wooden table, a single crisp papery snap'),
  f('rubber-stamp', 'Stamp', 'paper', ['stamp', 'approve', 'rubber', 'thud', 'confirm'], 'A rubber stamp pressed onto paper.', 'single', 'A single rubber stamp pressed firmly onto paper on a desk'),

  // Objects
  f('camera-shutter', 'Camera shutter', 'objects', ['camera', 'shutter', 'photo', 'screenshot', 'capture'], 'A single camera shutter.', 'single', 'A single short camera shutter click'),
  f('film-wind', 'Film advance', 'objects', ['camera', 'film', 'wind', 'advance', 'ratchet', 'retro'], 'A film camera advance lever winding.', 'all', 'A film camera advance lever being wound once'),
  f('light-switch', 'Light switch', 'objects', ['switch', 'light', 'toggle', 'wall', 'click'], 'A wall light switch flipped.', 'single', 'A single wall light switch flipped on'),
  f('door-knock', 'Door knock', 'objects', ['knock', 'door', 'wood', 'visitor', 'attention'], 'Two knocks on a wooden door.', 'all', 'Knock knock: two firm knuckle knocks on a closed wooden front door, a hollow resonant wooden thud, recorded from inside the room'),
  f('glass-tap', 'Wine glass tap', 'objects', ['glass', 'wine glass', 'tap', 'ring', 'ting', 'toast'], 'A spoon tapping a wine glass.', 'single', 'A metal spoon tapping a crystal wine glass once, ringing'),
  f('mug-tap', 'Mug tap', 'objects', ['ceramic', 'mug', 'cup', 'tap', 'clink', 'coffee'], 'A spoon tapping a ceramic mug.', 'single', 'A metal spoon tapping a ceramic coffee mug once'),
  f('coin-drop', 'Coin drop', 'objects', ['coin', 'drop', 'money', 'bounce', 'metal'], 'A coin dropped on a table, bouncing to rest.', 'all', 'A single coin dropped on a wooden table, bouncing and settling'),
  f('coins-jingle', 'Coins', 'objects', ['coins', 'money', 'jingle', 'payment', 'pocket'], 'A handful of coins jingling.', 'all', 'A small handful of coins jingling in a hand, short'),
  f('cash-register', 'Cash register', 'objects', ['cash register', 'money', 'sale', 'payment', 'ding', 'vintage'], 'A vintage cash register ringing up a sale.', 'all', 'A vintage mechanical cash register bell ding with the drawer opening'),
  f('keys-jingle', 'Keys', 'objects', ['keys', 'keyring', 'jingle', 'metal', 'access'], 'A ring of keys jingling.', 'all', 'A ring of metal keys jingling briefly'),
  f('zipper', 'Zipper', 'objects', ['zipper', 'zip', 'close', 'bag', 'pack'], 'A short zipper pull.', 'all', 'A short quick zipper pull on a bag'),
  f('bubble-wrap', 'Bubble wrap', 'objects', ['bubble wrap', 'pop', 'snap', 'satisfying', 'plastic'], 'One bubble-wrap bubble popping.', 'single', 'A single bubble wrap bubble popped between fingers'),
  f('cork-pop', 'Cork pop', 'objects', ['cork', 'pop', 'champagne', 'celebrate', 'bottle'], 'A cork pulled from a bottle.', 'single', 'A single cork popping out of a wine bottle'),
  f('water-drop', 'Water drop', 'objects', ['water', 'drop', 'drip', 'liquid', 'plink'], 'A single water drop into a basin.', 'single', 'A single water drop falling into a small basin of water'),

  // App actions: real-world sounds that match a verb in an app
  f('scissors-snip', 'Scissors snip', 'app actions', ['cut', 'scissors', 'snip', 'trim', 'crop'], 'One snip of scissors, for cut.', 'single', 'A single snip of metal scissors cutting paper'),
  f('book-close', 'Book close', 'app actions', ['archive', 'book', 'close', 'done', 'thump'], 'A hardcover book shutting, for archive.', 'single', 'A hardcover book being closed firmly'),
  f('drawer-shut', 'Drawer shut', 'app actions', ['archive', 'drawer', 'file away', 'close', 'wood'], 'A wooden drawer sliding shut, for file away.', 'all', 'A wooden desk drawer pushed shut quickly, a brief slide that ends in a firm wooden thud, starting immediately'),
  f('thumbtack-push', 'Thumbtack', 'app actions', ['pin', 'thumbtack', 'corkboard', 'push', 'save'], 'A thumbtack pressed into cork, for pin.', 'single', 'A single thumbtack pushed into a cork board'),
  f('marker-squeak', 'Marker', 'app actions', ['highlight', 'marker', 'squeak', 'draw', 'mark'], 'A marker drawing one short stroke, for highlight.', 'all', 'A felt marker drawing one short quick stroke on paper with a slight squeak'),
  f('eraser-rub', 'Eraser', 'app actions', ['erase', 'clear', 'eraser', 'rub', 'undo'], 'A pencil eraser rubbing, for clear.', 'all', 'A rubber pencil eraser rubbed back and forth on paper, short'),
  f('pencil-scribble', 'Pencil scribble', 'app actions', ['draw', 'pencil', 'scribble', 'sketch', 'write'], 'A quick pencil scribble, for draw.', 'all', 'A quick short pencil scribble on paper'),
  f('sticky-note-peel', 'Sticky note', 'app actions', ['note', 'sticky note', 'peel', 'new', 'post-it'], 'A sticky note peeled off a pad, for new note.', 'all', 'A sticky note being peeled off a pad'),
  f('tape-pull', 'Tape pull', 'app actions', ['attach', 'tape', 'stick', 'pull', 'clip'], 'A strip of tape pulled off a roll, for attach.', 'all', 'One single quick pull of adhesive tape off a roll, a short clean sticky rip under one second, nothing else'),
  f('folder-drop', 'Folder drop', 'app actions', ['file', 'folder', 'drop', 'save', 'organize'], 'A paper folder dropped on a stack, for file.', 'single', 'A manila paper folder dropped flat onto a stack of papers on a desk'),
];

// Length caps in seconds, set by reading each take's level over time.
// Single hits default to 0.6 s and gestures to 2 s.
const maxS = {
  'glass-tap': 1.2, 'light-switch': 0.35, spacebar: 0.45,
  'marker-squeak': 1.35, 'eraser-rub': 1.0, 'sticky-note-peel': 0.6, 'tape-pull': 1.1,
};
for (const p of seedPrompts) if (maxS[p.id]) p.maxS = maxS[p.id];

// Gaps that belong to the sound, in ms: the pause between two knocks, a coin
// bouncing, keys shaking. Longer silences still split off extra takes.
const rhythmMs = { 'door-knock': 400, 'coin-drop': 300, 'keys-jingle': 250 };
for (const [id, ms] of Object.entries(rhythmMs)) seedPrompts.find((p) => p.id === id).rhythmMs = ms;
// Level offsets in dB, for sounds that are too loud next to the rest.
seedPrompts.find((p) => p.id === 'trash-bin').levelDb = -6;
seedPrompts.find((p) => p.id === 'paper-slide').levelDb = -6;
seedPrompts.find((p) => p.id === 'drawer-shut').preRollS = 0.3;
// Struck sounds that should ring out instead of stopping short.
for (const id of ['glass-tap', 'mug-tap', 'cash-register', 'coin-drop']) seedPrompts.find((p) => p.id === id).ring = true;
