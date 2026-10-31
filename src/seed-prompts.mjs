// Real-world foley generated with Higgsfield Seed Audio 1.0.
// mode 'single' keeps only the loudest event; 'all' keeps the whole gesture.

const STYLE = 'isolated foley sound effect, close mic, dry studio recording, no background noise, no music, no voice, no speech';
const f = (id, name, category, tags, description, mode, what) => ({
  id, name, category, tags, description, source: 'seed-audio', mode, prompt: `${what}, ${STYLE}`,
});

export const seedPrompts = [
  // Keyboard and desk
  f('key-mechanical', 'Mechanical key', 'keyboard', ['key', 'keyboard', 'mechanical', 'thock', 'press', 'typing'], 'One press on a mechanical keyboard.', 'single', 'A single crisp mechanical keyboard key press'),
  f('key-laptop', 'Laptop key', 'keyboard', ['key', 'keyboard', 'laptop', 'scissor', 'quiet', 'press'], 'One soft press on a laptop keyboard.', 'single', 'A single soft laptop keyboard key press, low-profile scissor switch'),
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
  f('paper-slide', 'Paper slide', 'paper', ['paper', 'slide', 'desk', 'swipe', 'move'], 'A sheet of paper sliding across a desk.', 'all', 'A single sheet of paper sliding across a wooden desk'),
  f('trash-bin', 'Into the bin', 'paper', ['trash', 'bin', 'delete', 'discard', 'empty', 'paper'], 'A paper ball dropped into a metal bin.', 'all', 'A crumpled paper ball dropped into an empty metal trash bin'),
  f('envelope-open', 'Envelope open', 'paper', ['envelope', 'open', 'mail', 'letter', 'inbox', 'tear'], 'A paper envelope being torn open.', 'all', 'A paper envelope being torn open, short'),
  f('card-flip', 'Card flip', 'paper', ['card', 'flip', 'playing card', 'reveal', 'deal'], 'A playing card flipped onto a table.', 'single', 'A single playing card flipped and snapped onto a felt table'),
  f('rubber-stamp', 'Stamp', 'paper', ['stamp', 'approve', 'rubber', 'thud', 'confirm'], 'A rubber stamp pressed onto paper.', 'single', 'A single rubber stamp pressed firmly onto paper on a desk'),

  // Objects
  f('camera-shutter', 'Camera shutter', 'objects', ['camera', 'shutter', 'photo', 'screenshot', 'capture'], 'A single camera shutter.', 'single', 'A single short camera shutter click'),
  f('film-wind', 'Film advance', 'objects', ['camera', 'film', 'wind', 'advance', 'ratchet', 'retro'], 'A film camera advance lever winding.', 'all', 'A film camera advance lever being wound once'),
  f('light-switch', 'Light switch', 'objects', ['switch', 'light', 'toggle', 'wall', 'click'], 'A wall light switch flipped.', 'single', 'A single wall light switch flipped on'),
  f('door-knock', 'Door knock', 'objects', ['knock', 'door', 'wood', 'visitor', 'attention'], 'Two knocks on a wooden door.', 'all', 'Exactly two knuckle knocks on a solid wooden door'),
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
];

// Length caps in seconds, set by reading each take's level over time.
// Single hits default to 0.6 s and gestures to 2 s.
const maxS = { 'glass-tap': 1.2, 'light-switch': 0.35, spacebar: 0.45 };
for (const p of seedPrompts) if (maxS[p.id]) p.maxS = maxS[p.id];
