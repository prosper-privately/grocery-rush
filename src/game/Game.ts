import { defaultConfig, GameConfig } from '../types/GameConfig';

type Direction = 'up' | 'down' | 'left' | 'right' | '';
type GamePhase = 'ready' | 'playing' | 'paused' | 'won' | 'lost';
const levelProductPools = [
  ['product-01-can-red', 'product-11-apple', 'product-12-bananas', 'product-13-carrot', 'product-14-broccoli', 'product-18-watermelon', 'product-31-bread', 'product-32-eggs', 'product-33-milk-jug', 'product-35-cheese'],
  ['product-02-can-blue', 'product-15-tomatoes', 'product-16-eggplant', 'product-17-corn', 'product-20-pineapple', 'product-21-grapes', 'product-34-yogurt', 'product-36-pasta', 'product-38-rice-sack', 'product-42-jam'],
  ['product-03-bottle-green', 'product-22-avocado', 'product-23-bell-pepper', 'product-24-onion', 'product-26-lemon', 'product-30-pear', 'product-37-chocolate', 'product-40-flour', 'product-44-honey-bear', 'product-47-butter'],
  ['product-04-bottle-purple', 'product-19-strawberries', 'product-25-mushrooms', 'product-27-cherries', 'product-28-cauliflower', 'product-29-cucumber', 'product-39-frozen-peas', 'product-41-coffee', 'product-43-peanut-butter', 'product-48-cookie-roll'],
  ['product-05-crate-wood', 'product-11-apple', 'product-15-tomatoes', 'product-20-pineapple', 'product-24-onion', 'product-30-pear', 'product-45-fish-tray', 'product-46-roast-chicken', 'product-49-ice-cream', 'product-50-dish-soap'],
  ['product-06-crate-navy', 'product-12-bananas', 'product-16-eggplant', 'product-21-grapes', 'product-25-mushrooms', 'product-29-cucumber', 'product-31-bread', 'product-34-yogurt', 'product-38-rice-sack', 'product-45-fish-tray'],
  ['product-07-carton-yellow', 'product-13-carrot', 'product-17-corn', 'product-22-avocado', 'product-26-lemon', 'product-27-cherries', 'product-32-eggs', 'product-36-pasta', 'product-42-jam', 'product-46-roast-chicken'],
  ['product-08-carton-pink', 'product-14-broccoli', 'product-18-watermelon', 'product-23-bell-pepper', 'product-28-cauliflower', 'product-30-pear', 'product-33-milk-jug', 'product-37-chocolate', 'product-43-peanut-butter', 'product-49-ice-cream'],
  ['product-09-bottle-amber', 'product-15-tomatoes', 'product-19-strawberries', 'product-20-pineapple', 'product-24-onion', 'product-29-cucumber', 'product-35-cheese', 'product-39-frozen-peas', 'product-44-honey-bear', 'product-50-dish-soap'],
  ['product-10-can-gold', 'product-11-apple', 'product-12-bananas', 'product-21-grapes', 'product-25-mushrooms', 'product-27-cherries', 'product-40-flour', 'product-41-coffee', 'product-47-butter', 'product-48-cookie-roll'],
  ['product-01-can-red', 'product-07-carton-yellow', 'product-11-apple', 'product-21-grapes', 'product-27-cherries', 'product-29-cucumber', 'product-31-bread', 'product-35-cheese', 'product-42-jam', 'product-48-cookie-roll'],
  ['product-02-can-blue', 'product-09-bottle-amber', 'product-12-bananas', 'product-19-strawberries', 'product-26-lemon', 'product-30-pear', 'product-32-eggs', 'product-33-milk-jug', 'product-40-flour', 'product-47-butter'],
  ['product-03-bottle-green', 'product-05-crate-wood', 'product-13-carrot', 'product-14-broccoli', 'product-15-tomatoes', 'product-16-eggplant', 'product-24-onion', 'product-36-pasta', 'product-38-rice-sack', 'product-46-roast-chicken'],
  ['product-04-bottle-purple', 'product-10-can-gold', 'product-17-corn', 'product-18-watermelon', 'product-20-pineapple', 'product-22-avocado', 'product-23-bell-pepper', 'product-34-yogurt', 'product-44-honey-bear', 'product-49-ice-cream'],
  ['product-06-crate-navy', 'product-08-carton-pink', 'product-25-mushrooms', 'product-28-cauliflower', 'product-29-cucumber', 'product-30-pear', 'product-31-bread', 'product-35-cheese', 'product-43-peanut-butter', 'product-45-fish-tray'],
  ['product-01-can-red', 'product-09-bottle-amber', 'product-11-apple', 'product-12-bananas', 'product-21-grapes', 'product-27-cherries', 'product-37-chocolate', 'product-41-coffee', 'product-48-cookie-roll', 'product-49-ice-cream'],
  ['product-02-can-blue', 'product-07-carton-yellow', 'product-13-carrot', 'product-16-eggplant', 'product-17-corn', 'product-23-bell-pepper', 'product-26-lemon', 'product-33-milk-jug', 'product-39-frozen-peas', 'product-42-jam'],
  ['product-03-bottle-green', 'product-06-crate-navy', 'product-14-broccoli', 'product-15-tomatoes', 'product-22-avocado', 'product-24-onion', 'product-28-cauliflower', 'product-36-pasta', 'product-38-rice-sack', 'product-46-roast-chicken'],
  ['product-04-bottle-purple', 'product-08-carton-pink', 'product-18-watermelon', 'product-19-strawberries', 'product-20-pineapple', 'product-25-mushrooms', 'product-29-cucumber', 'product-34-yogurt', 'product-44-honey-bear', 'product-50-dish-soap'],
  ['product-05-crate-wood', 'product-10-can-gold', 'product-11-apple', 'product-13-carrot', 'product-21-grapes', 'product-27-cherries', 'product-30-pear', 'product-32-eggs', 'product-40-flour', 'product-47-butter'],
] as const;

type ShelfProductKind = (typeof levelProductPools)[number][number];
type ShelfProductConfig = {
  shelfIndex: number;
  xCells: number;
  yOffsetCells: number;
  widthCells: number;
  heightCells: number;
  kind: ShelfProductKind;
};
type CustomerProfile = {
  name: string;
  avatar: string;
  request: string;
  payoff: string;
};

export class Game {
  private container: HTMLElement;
  private config: GameConfig;
  private characterX: number;
  private characterY: number;
  private lastTime: number;
  private accumulator: number;
  private fps: number;
  private character: HTMLDivElement;
  private direction: Direction;
  private pressedDirections = new Set<Exclude<Direction, ''>>();
  private facingDirection: 'left' | 'right';
  private canCollectShoppingList = false;
  private readonly movementSpeedCellsPerSecond = 7.5;
  private readonly boostSpeedMultiplier = 1.8;
  private readonly boostDurationMs = 650;
  private readonly boostCooldownMs = 2_600;
  private boostRemainingMs = 0;
  private boostCooldownRemainingMs = 0;
  private readonly swipeThresholdPixels = 12;
  private readonly horizontalFlickFollowThroughMs = 180;
  // Shelf rows are measured at the top edge of each shelf in game cells.
  // Character bottom should sit on these rows.
  private readonly shelfRows: readonly number[] = [1.825, 3.15, 4.5, 5.875, 7.225, 8.6];
  private readonly floorShelfIndex = this.shelfRows.length - 1;
  private readonly jumpDurationMs = 230;
  private readonly jumpHeightCells = 0.7;
  private readonly walkAnimationStepMs = 70;
  private readonly spriteFrameScaleX = 1.1;
  private readonly shelfProducts: readonly ShelfProductConfig[] = [
    { shelfIndex: 0, xCells: 1.25, yOffsetCells: 0.02, widthCells: 1.0, heightCells: 0.62, kind: 'product-01-can-red' },
    { shelfIndex: 0, xCells: 6.75, yOffsetCells: 0.0, widthCells: 0.98, heightCells: 0.63, kind: 'product-02-can-blue' },
    { shelfIndex: 0, xCells: 11.75, yOffsetCells: 0.02, widthCells: 1.02, heightCells: 0.6, kind: 'product-03-bottle-green' },
    { shelfIndex: 1, xCells: 1.0, yOffsetCells: 0.0, widthCells: 1.12, heightCells: 0.72, kind: 'product-04-bottle-purple' },
    { shelfIndex: 1, xCells: 4.65, yOffsetCells: 0.02, widthCells: 1.04, heightCells: 0.62, kind: 'product-05-crate-wood' },
    { shelfIndex: 1, xCells: 8.25, yOffsetCells: 0.01, widthCells: 1.08, heightCells: 0.65, kind: 'product-06-crate-navy' },
    { shelfIndex: 1, xCells: 11.7, yOffsetCells: 0.01, widthCells: 0.96, heightCells: 0.6, kind: 'product-07-carton-yellow' },
    { shelfIndex: 2, xCells: 1.25, yOffsetCells: 0.02, widthCells: 1.1, heightCells: 0.67, kind: 'product-08-carton-pink' },
    { shelfIndex: 2, xCells: 4.65, yOffsetCells: 0.0, widthCells: 0.94, heightCells: 0.6, kind: 'product-09-bottle-amber' },
    { shelfIndex: 2, xCells: 8.15, yOffsetCells: 0.02, widthCells: 1.05, heightCells: 0.64, kind: 'product-10-can-gold' },
    { shelfIndex: 2, xCells: 11.65, yOffsetCells: 0.01, widthCells: 1.0, heightCells: 0.6, kind: 'product-02-can-blue' },
    { shelfIndex: 3, xCells: 1.7, yOffsetCells: 0.01, widthCells: 1.08, heightCells: 0.68, kind: 'product-03-bottle-green' },
    { shelfIndex: 3, xCells: 6.7, yOffsetCells: 0.0, widthCells: 1.14, heightCells: 0.66, kind: 'product-05-crate-wood' },
    { shelfIndex: 3, xCells: 11.2, yOffsetCells: 0.02, widthCells: 1.02, heightCells: 0.63, kind: 'product-01-can-red' },
    { shelfIndex: 4, xCells: 1.35, yOffsetCells: 0.0, widthCells: 1.0, heightCells: 0.6, kind: 'product-07-carton-yellow' },
    { shelfIndex: 4, xCells: 6.35, yOffsetCells: 0.02, widthCells: 0.98, heightCells: 0.6, kind: 'product-06-crate-navy' },
    { shelfIndex: 4, xCells: 10.95, yOffsetCells: 0.03, widthCells: 1.0, heightCells: 0.58, kind: 'product-08-carton-pink' },
    { shelfIndex: 5, xCells: 1.7, yOffsetCells: 0.02, widthCells: 1.16, heightCells: 0.7, kind: 'product-04-bottle-purple' },
    { shelfIndex: 5, xCells: 6.65, yOffsetCells: 0.02, widthCells: 1.12, heightCells: 0.68, kind: 'product-09-bottle-amber' },
    { shelfIndex: 5, xCells: 11.2, yOffsetCells: 0.01, widthCells: 1.06, heightCells: 0.62, kind: 'product-10-can-gold' },
  ];

  private readonly allShelfProductKinds: readonly ShelfProductKind[];
  private readonly customers: readonly CustomerProfile[] = [
    { name: 'Nana Bea', avatar: 'customer-01-nana-bea.png', request: 'Her grandkids arrive at closing, and movie night still needs snacks.', payoff: 'Nana Bea made it home before the opening credits.' },
    { name: 'Coach Rivera', avatar: 'customer-02-coach-rivera.png', request: 'The team bus is pulling in, but the post-game spread is still empty.', payoff: 'Coach Rivera had the table ready when the team arrived.' },
    { name: 'Mina & Mochi', avatar: 'customer-03-mina-and-mochi.png', request: 'Mina promised her cat a tiny birthday picnic after work.', payoff: 'Mochi approved the picnic—and demanded seconds.' },
    { name: 'Night-Shift Niko', avatar: 'customer-04-night-shift-niko.png', request: 'Niko needs a break-room rescue before the overnight crew clocks in.', payoff: 'The night crew cheered when Niko rolled in with the order.' },
    { name: 'Auntie June', avatar: 'customer-05-auntie-june.png', request: 'A surprise dinner has one missing ingredient list and no time to spare.', payoff: 'Auntie June saved the surprise dinner without missing a beat.' },
    { name: 'Sam the Baker', avatar: 'customer-06-sam-the-baker.png', request: 'Tomorrow’s first batch starts at dawn, and the pantry is bare.', payoff: 'Sam’s ovens were warm before sunrise.' },
    { name: 'Gus the Gardener', avatar: 'customer-07-gus-the-gardener.png', request: 'The neighborhood seed swap starts at sunrise, but Gus forgot the picnic table.', payoff: 'Gus fed every gardener before the first seed changed hands.' },
    { name: 'Priya the Paramedic', avatar: 'customer-08-priya-the-paramedic.png', request: 'Priya promised a midnight potluck after the crew’s longest shift of the month.', payoff: 'Priya turned the quiet break room into a midnight feast.' },
    { name: 'Theo & Tumble', avatar: 'customer-09-theo-and-tumble.png', request: 'Tumble finally passed puppy school, and Theo planned a backyard graduation party.', payoff: 'Tumble earned his diploma—and one extremely tiny party hat.' },
    { name: 'Captain Marisol', avatar: 'customer-10-captain-marisol.png', request: 'The ferry crew just finished its final crossing and needs a dockside supper.', payoff: 'Captain Marisol toasted a smooth season beneath the harbor lights.' },
    { name: 'Mr. Okafor', avatar: 'customer-11-mr-okafor.png', request: 'The chess club finals begin tonight, and Mr. Okafor forgot the players’ lucky snacks.', payoff: 'Mr. Okafor’s rook won the cup just before the last crumb vanished.' },
    { name: 'DJ Dot', avatar: 'customer-12-dj-dot.png', request: 'Dot’s community-radio anniversary show needs enough snacks for one final dance set.', payoff: 'DJ Dot kept the whole block dancing past the closing theme.' },
    { name: 'Ranger Rowan', avatar: 'customer-13-ranger-rowan.png', request: 'Rowan’s trail-cleanup crew is hiking back muddy, proud, and very hungry.', payoff: 'Ranger Rowan welcomed every volunteer with a warm trail-side meal.' },
    { name: 'Tía Sol', avatar: 'customer-14-tia-sol.png', request: 'Her niece’s first dance recital ends soon, and the family celebration table is empty.', payoff: 'Tía Sol made the little dancer’s curtain call taste like sunshine.' },
    { name: 'Jojo the Mechanic', avatar: 'customer-15-jojo-the-mechanic.png', request: 'Jojo’s crew revived the old ice-cream truck and promised everyone a victory lunch.', payoff: 'Jojo served lunch beside an engine that purred like a kitten.' },
    { name: 'Librarian Lou', avatar: 'customer-16-librarian-lou.png', request: 'Tonight’s pajama story hour has dragons, blankets, and no snacks for the readers.', payoff: 'Lou’s tiny readers crunched along with every dragon in the tale.' },
    { name: 'Arlo the Astronomer', avatar: 'customer-17-arlo-the-astronomer.png', request: 'A meteor shower peaks at midnight, and Arlo’s rooftop cocoa station is bare.', payoff: 'Arlo counted forty meteors over forty steaming cups.' },
    { name: 'Mei & Pippin', avatar: 'customer-18-mei-and-pippin.png', request: 'Mei’s rabbit found the picnic basket, but the moonlight picnic never found its groceries.', payoff: 'Mei and Pippin shared the quietest, crunchiest picnic in the park.' },
    { name: 'Firefighter Fran', avatar: 'customer-19-firefighter-fran.png', request: 'Fran promised the station a pancake breakfast after an all-night call.', payoff: 'Firefighter Fran flipped the first pancake as the sun came up.' },
    { name: 'Mayor Mabel', avatar: 'customer-20-mayor-mabel.png', request: 'The town lantern festival is ready to glow, but its final supper table is empty.', payoff: 'Mayor Mabel lit the last lantern above a feast for the whole town.' },
  ];
  private readonly resetMapPrompts = [
    'You left work. Now leave the screen.',
    'This game is a break. Your body needs one too.',
    'Your next side quest starts away from the desk.',
    'You moved in-game. Now move IRL.',
    'Unlock a break that gets you off-screen.',
    'Step away. Respawn with clarity.',
  ] as const;
  private readonly resetMapPrompt = this.resetMapPrompts[Math.floor(Math.random() * this.resetMapPrompts.length)];
  private readonly orderNumber: number;
  private readonly shoppingListSize: number;
  private readonly collisionTolerance = 8;
  private readonly collectionAnimationDurationMs = 420;
  private renderedShelfProductElements = new Map<string, HTMLDivElement>();
  private shoppingListEntries: Array<{
    node: HTMLDivElement;
    productKind: ShelfProductKind;
    productId: string;
    collected: boolean;
  }> = [];
  private shoppingListContainer: HTMLDivElement | null = null;
  private shoppingListCollectedCount = 0;
  private shoppingListCounter: HTMLDivElement | null = null;
  private readonly roundDurationMs: number;
  private checkoutReady = false;
  private checkoutZone: HTMLDivElement | null = null;
  private roundRemainingMs = 0;
  private gamePhase: GamePhase = 'ready';
  private score = 0;
  private bestScore: number;
  private shiftScore: number;
  private bestShiftScore: number;
  private creditedOrderNumber: number;
  private isMuted: boolean;
  private comboCount = 0;
  private maxComboCount = 0;
  private lastPickupAt = 0;
  private readonly comboWindowMs: number;
  private roundTimer: HTMLSpanElement | null = null;
  private scoreDisplay: HTMLSpanElement | null = null;
  private comboDisplay: HTMLSpanElement | null = null;
  private comboMeterFill: HTMLSpanElement | null = null;
  private pauseButton: HTMLButtonElement | null = null;
  private soundButton: HTMLButtonElement | null = null;
  private boostButton: HTMLButtonElement | null = null;
  private bonusCoupon: HTMLDivElement | null = null;
  private bonusCouponCollected = false;
  private aisleHazards: HTMLDivElement[] = [];
  private hazardHitCount = 0;
  private stockCart: HTMLDivElement | null = null;
  private stockCartState: 'warning' | 'crossing' | 'cooldown' = 'warning';
  private stockCartElapsedMs = 0;
  private stockCartX = -1.4;
  private stockCartDirection: 1 | -1 = 1;
  private stockCartShelfIndex = 3;
  private stumbleRemainingMs = 0;
  private stockCartCollisionArmed = true;
  private stockCartHitCount = 0;
  private readonly fallDurationMs = 650;
  private isFalling = false;
  private fallElapsedMs = 0;
  private fallStartY = 0;
  private fallTargetY = 0;
  private fallStartX = 0;
  private fallTargetX = 0;
  private fallCount = 0;
  private roundOverlay: HTMLDivElement | null = null;
  private audioContext: AudioContext | null = null;
  private musicPulseTimer: number | null = null;
  private musicPulseStep = 0;

  private get customer(): CustomerProfile {
    return this.customers[(this.orderNumber - 1) % this.customers.length];
  }

  private get isFinalOrder(): boolean {
    return this.orderNumber === this.customers.length;
  }
  private currentShelfIndex: number;
  private characterHeightCells = 0;
  private characterWidthCells = 0;
  private targetShelfIndex: number;
  private isJumping = false;
  private walkFrame = 0;
  private walkAnimationAccumulator = 0;
  private jumpStartY = 0;
  private jumpTargetY = 0;
  private jumpElapsedMs = 0;
  private spriteFrameWidthPx: number;

  private isSwipeActive = false;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private clearSwipeDirectionAfterFrame = false;
  private swipeFollowThroughRemainingMs = 0;

  constructor(container: HTMLElement, config: GameConfig = defaultConfig) {
    this.container = container;
    this.config = config;
    const persistentResetMapPrompt = document.querySelector<HTMLElement>('.play-reset-map-link .reset-map-prompt');
    if (persistentResetMapPrompt) {
      persistentResetMapPrompt.textContent = this.resetMapPrompt;
    }
    this.orderNumber = this.readStoredInteger('grocery-rush-order', 1, 1, this.customers.length);
    this.allShelfProductKinds = levelProductPools[this.orderNumber - 1];
    this.comboWindowMs = Math.max(3_000, 4_000 - (this.orderNumber - 1) * 200);
    this.shoppingListSize = Math.min(8, 4 + this.orderNumber);
    this.roundDurationMs = Math.max(30_000, 45_000 - (this.orderNumber - 1) * 3_000);
    const legacyBestScore = this.readStoredInteger('grocery-rush-best', 0, 0, 999_999);
    this.bestScore = this.readStoredInteger(`grocery-rush-best-order-${this.orderNumber}`, legacyBestScore, 0, 999_999);
    this.shiftScore = this.readStoredInteger('grocery-rush-shift-score', 0, 0, 9_999_999);
    this.bestShiftScore = this.readStoredInteger('grocery-rush-best-shift', 0, 0, 9_999_999);
    this.creditedOrderNumber = this.readStoredInteger('grocery-rush-credited-order', 0, 0, this.customers.length);
    this.isMuted = this.readStoredInteger('grocery-rush-muted', 0, 0, 1) === 1;
    this.characterX = 0;
    this.currentShelfIndex = this.floorShelfIndex;
    this.targetShelfIndex = this.floorShelfIndex;
    this.characterY = 0;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.fps = config.fps;
    this.character = document.createElement('div');
    this.character.className = 'character';
    this.direction = '';
    this.facingDirection = 'right';
    this.spriteFrameWidthPx = 0;
    this.init();
  }

  private get gridWidth(): number {
    return this.config.gridWidth ?? this.config.gridSize;
  }

  private get gridHeight(): number {
    return this.config.gridHeight ?? this.config.gridSize;
  }

  private init(): void {
    this.container.innerHTML = '';
    this.shoppingListCollectedCount = 0;
    this.checkoutReady = false;
    this.checkoutZone = null;
    this.container.dataset.objective = 'items';
    this.score = 0;
    this.comboCount = 0;
    this.maxComboCount = 0;
    this.lastPickupAt = 0;
    this.pressedDirections.clear();
    this.boostRemainingMs = 0;
    this.boostCooldownRemainingMs = 0;
    this.bonusCouponCollected = false;
    this.aisleHazards = [];
    this.hazardHitCount = 0;
    this.container.dataset.hazardHits = '0';
    this.stockCart = null;
    this.stockCartState = 'warning';
    this.stockCartElapsedMs = 0;
    this.stockCartX = -1.4;
    this.stockCartDirection = 1;
    this.stockCartShelfIndex = Math.min(4, 1 + (this.orderNumber % 4));
    this.stumbleRemainingMs = 0;
    this.stockCartCollisionArmed = true;
    this.stockCartHitCount = 0;
    this.container.dataset.cartHits = '0';
    this.isFalling = false;
    this.fallElapsedMs = 0;
    this.fallCount = 0;
    this.container.dataset.falls = '0';
    this.container.dataset.comboWindowMs = String(this.comboWindowMs);
    this.stopMusicPulse();
    this.roundRemainingMs = this.roundDurationMs;
    this.gamePhase = 'ready';
    this.renderShelfBackground();
    this.renderShelfEmptySlots();
    this.renderShelfProducts();
    this.renderShoppingList();
    this.renderBonusCoupon();
    this.renderAisleHazards();
    this.renderStockCart();
    this.updateShoppingListCounter();
    this.container.appendChild(this.character);
    this.renderGameChrome();
    this.setupUtilityControls();
    this.setCharacterSpriteFrame(1);
    const measuredHeight = this.character.offsetHeight;
    const measuredWidth = this.character.offsetWidth;
    this.characterHeightCells = measuredHeight > 0 ? measuredHeight / this.config.cellSize : 0.6;
    this.characterWidthCells = measuredWidth > 0 ? measuredWidth / this.config.cellSize : 1.5;
    this.spriteFrameWidthPx = Math.max(1, Math.round(measuredWidth * this.spriteFrameScaleX));
    this.characterY = this.shelfRowsToCharacterY(this.currentShelfIndex);
    this.updateCharacterPosition();
    this.canCollectShoppingList = false;
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
    this.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
    this.container.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    this.container.addEventListener('touchcancel', this.handleTouchEnd, { passive: false });
    this.container.addEventListener('pointerdown', this.handlePointerDown, { passive: false });
    this.container.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    this.container.addEventListener('pointerup', this.handlePointerEnd, { passive: false });
    this.container.addEventListener('pointercancel', this.handlePointerEnd, { passive: false });
    this.start();
  }

  private start(): void {
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  private loop(timestamp: number): void {
    const delta = timestamp - this.lastTime;
    this.lastTime = timestamp;
    this.accumulator += delta;

    while (this.accumulator >= 1000 / this.fps) {
      this.update(1000 / this.fps);
      this.accumulator -= 1000 / this.fps;
    }

    this.draw();
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  private update(dt: number): void {
    if (this.gamePhase !== 'playing') {
      return;
    }

    this.roundRemainingMs = Math.max(0, this.roundRemainingMs - dt);
    this.updateRoundTimer();
    if (this.roundRemainingMs <= 0) {
      this.finishRound('lost');
      return;
    }

    if (this.comboCount > 0 && this.lastPickupAt > 0 && performance.now() - this.lastPickupAt > this.comboWindowMs) {
      this.comboCount = 0;
      this.lastPickupAt = 0;
      this.updateComboDisplay();
    }
    this.updateComboMeter();
    this.updateStockCart(dt);

    if (this.boostRemainingMs > 0) {
      this.boostRemainingMs = Math.max(0, this.boostRemainingMs - dt);
      if (this.boostRemainingMs === 0) {
        this.character.classList.remove('is-boosting');
      }
    }
    if (this.boostCooldownRemainingMs > 0) {
      this.boostCooldownRemainingMs = Math.max(0, this.boostCooldownRemainingMs - dt);
      this.updateBoostButton();
    }

    const dx = this.characterDirectionX();
    const dy = this.characterDirectionY();
    this.updateCharacterSprite(dt, dx, dy);

    if (this.stumbleRemainingMs > 0) {
      this.stumbleRemainingMs = Math.max(0, this.stumbleRemainingMs - dt);
      if (this.stumbleRemainingMs === 0) {
        this.character.classList.remove('is-stumbling');
      }
      return;
    }

    if (this.isFalling) {
      this.updateFall(dt);
      return;
    }

    const speed = this.movementSpeedCellsPerSecond * (this.boostRemainingMs > 0 ? this.boostSpeedMultiplier : 1);
    const deltaCells = (speed * dt) / 1000;
    const newX = this.characterX + dx * deltaCells;
    const { minX, maxX } = this.getHorizontalBounds(this.currentShelfIndex);

    if (newX >= minX && newX <= maxX) {
      this.characterX = newX;
    } else if (dx !== 0 && this.currentShelfIndex !== this.floorShelfIndex) {
      this.characterX = dx < 0 ? minX : maxX;
      this.startEdgeFall();
      return;
    } else {
      this.characterX = Math.max(minX, Math.min(maxX, newX));
    }

    if (this.isJumping) {
      this.updateJump(dt);
    } else if (dy !== 0) {
      this.tryStartJump(dy);
    }

    if (!this.isJumping && !this.isFalling) {
      this.characterY = this.shelfRowsToCharacterY(this.currentShelfIndex);
    }

    if (!this.isSwipeActive && this.swipeFollowThroughRemainingMs > 0) {
      this.swipeFollowThroughRemainingMs = Math.max(0, this.swipeFollowThroughRemainingMs - dt);
      if (this.swipeFollowThroughRemainingMs === 0) {
        this.direction = '';
      }
    } else if (this.clearSwipeDirectionAfterFrame && !this.isSwipeActive) {
      this.direction = '';
      this.clearSwipeDirectionAfterFrame = false;
    }
  }

  private tryStartJump(dy: number): void {
    if (dy > 0) {
      this.targetShelfIndex = this.currentShelfIndex + 1;
    } else {
      this.targetShelfIndex = this.currentShelfIndex - 1;
    }

    if (this.targetShelfIndex < 0 || this.targetShelfIndex >= this.shelfRows.length) {
      return;
    }

    const targetBounds = this.getHorizontalBounds(this.targetShelfIndex);
    this.characterX = Math.max(targetBounds.minX, Math.min(targetBounds.maxX, this.characterX));
    this.isJumping = true;
    this.jumpElapsedMs = 0;
    this.jumpStartY = this.characterY;
    this.jumpTargetY = this.shelfRowsToCharacterY(this.targetShelfIndex);
  }

  private updateCharacterSprite(dt: number, dx: number, dy: number): void {
    if (dx < 0) {
      this.setFacingDirection('left');
    } else if (dx > 0) {
      this.setFacingDirection('right');
    }

    if (this.isJumping || dy !== 0) {
      this.walkFrame = 0;
      this.walkAnimationAccumulator = 0;
      this.setCharacterSpriteFrame(3);
      return;
    }

    if (dx === 0) {
      this.walkFrame = 0;
      this.walkAnimationAccumulator = 0;
      this.setCharacterSpriteFrame(0);
      return;
    }

    this.walkAnimationAccumulator += dt;
    if (this.walkAnimationAccumulator >= this.walkAnimationStepMs) {
      this.walkAnimationAccumulator -= this.walkAnimationStepMs;
      this.walkFrame = this.walkFrame === 0 ? 1 : 0;
    }

    this.setCharacterSpriteFrame(this.walkFrame + 1);
  }

  private setCharacterSpriteFrame(frameIndex: number): void {
    const clampedFrame = Math.max(0, Math.min(3, Math.floor(frameIndex)));
    const displayFrame = clampedFrame === 0 ? 1 : clampedFrame;
    const frameOffsetX = displayFrame * this.spriteFrameWidthPx;
    this.character.style.backgroundPosition = `${-frameOffsetX}px 100%`;
  }

  private setFacingDirection(facing: 'left' | 'right'): void {
    if (this.facingDirection === facing) {
      return;
    }

    this.facingDirection = facing;
    this.character.classList.toggle('facing-left', facing === 'left');
  }

  private updateJump(dt: number): void {
    this.jumpElapsedMs += dt;
    const jumpProgress = Math.min(1, this.jumpElapsedMs / this.jumpDurationMs);
    const baseY = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * jumpProgress;
    const jumpOffset = -this.jumpHeightCells * 4 * jumpProgress * (1 - jumpProgress);

    this.characterY = baseY + jumpOffset;

    if (jumpProgress >= 1) {
      this.isJumping = false;
      this.currentShelfIndex = this.targetShelfIndex;
      this.characterY = this.shelfRowsToCharacterY(this.currentShelfIndex);
      this.jumpElapsedMs = 0;
      this.updateRouteTarget();
    }
  }

  private startEdgeFall(): void {
    if (this.isFalling || this.currentShelfIndex === this.floorShelfIndex) {
      return;
    }

    this.isFalling = true;
    this.isJumping = false;
    this.fallElapsedMs = 0;
    this.fallStartY = this.characterY;
    this.fallTargetY = this.shelfRowsToCharacterY(this.floorShelfIndex);
    this.fallStartX = this.characterX;
    this.character.dataset.fallOriginX = String(this.fallStartX);
    const fellFromLeft = this.characterX <= this.getHorizontalBounds(this.currentShelfIndex).minX;
    this.fallTargetX = fellFromLeft ? 1 : this.gridWidth - 3;
    this.targetShelfIndex = this.floorShelfIndex;
    this.fallCount += 1;
    this.container.dataset.falls = String(this.fallCount);
    this.comboCount = 0;
    this.lastPickupAt = 0;
    this.updateComboDisplay();
    this.updateComboMeter();
    this.character.classList.add('is-falling');
    this.setCharacterSpriteFrame(3);
    this.pressedDirections.clear();
    this.direction = '';
    this.canCollectShoppingList = false;

    const feedback = document.createElement('div');
    feedback.className = 'fall-feedback';
    feedback.textContent = 'SHELF EDGE! · BACK TO THE FLOOR';
    this.container.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 1_100);
    this.playTone(135, 0.24, 'sawtooth', 0.028);
  }

  private updateFall(dt: number): void {
    this.fallElapsedMs += dt;
    const progress = Math.min(1, this.fallElapsedMs / this.fallDurationMs);
    const easedProgress = progress * progress;
    const fallFrame = Math.floor(this.fallElapsedMs / 110) % 4;
    this.character.style.backgroundPosition = `${-fallFrame * this.spriteFrameWidthPx}px 100%`;
    this.characterX = this.fallStartX + (this.fallTargetX - this.fallStartX) * progress;
    this.characterY = this.fallStartY + (this.fallTargetY - this.fallStartY) * easedProgress;

    if (progress < 1) {
      return;
    }

    this.isFalling = false;
    this.currentShelfIndex = this.floorShelfIndex;
    this.targetShelfIndex = this.floorShelfIndex;
    this.characterY = this.fallTargetY;
    this.fallElapsedMs = 0;
    this.character.classList.remove('is-falling');
    this.setCharacterSpriteFrame(1);
    this.updateRouteTarget();
  }

  private shelfRowsToCharacterY(shelfIndex: number): number {
    return this.shelfRows[shelfIndex] - this.characterHeightCells;
  }

  private shelfRowsToPixelY(shelfIndex: number): number {
    return this.shelfRows[shelfIndex] * this.config.cellSize;
  }

  private renderShelfBackground(): void {
    const backgroundLayer = document.createElement('div');
    backgroundLayer.className = 'shelf-background';

    const counter = document.createElement('div');
    counter.className = 'shopping-list-counter';
    counter.textContent = `${this.shoppingListCollectedCount}/${this.getShoppingListTotalCount()}`;
    this.shoppingListCounter = counter;
    backgroundLayer.appendChild(counter);

    this.container.appendChild(backgroundLayer);
  }

  private renderGameChrome(): void {
    const stage = this.container.closest('.game-stage') ?? this.container.parentElement;
    if (!stage) {
      return;
    }

    stage.querySelectorAll('.game-hud, .round-overlay').forEach((node) => node.remove());

    const hud = document.createElement('div');
    hud.className = 'game-hud';
    hud.setAttribute('aria-live', 'polite');

    const mission = document.createElement('div');
    mission.className = 'hud-card mission-card';
    mission.innerHTML = '<span class="hud-label">RUSH ORDER</span>';
    if (this.shoppingListCounter) {
      mission.appendChild(this.shoppingListCounter);
    }

    const timerCard = document.createElement('div');
    timerCard.className = 'hud-card timer-card';
    timerCard.innerHTML = '<span class="hud-label">CLOSING IN</span>';
    this.roundTimer = document.createElement('span');
    this.roundTimer.className = 'round-timer';
    timerCard.appendChild(this.roundTimer);
    if (this.shoppingListContainer) {
      timerCard.appendChild(this.shoppingListContainer);
    }

    const scoreCard = document.createElement('div');
    scoreCard.className = 'hud-card score-card';
    scoreCard.innerHTML = '<span class="hud-label">SCORE</span>';
    this.scoreDisplay = document.createElement('span');
    this.scoreDisplay.className = 'score-value';
    scoreCard.appendChild(this.scoreDisplay);
    this.comboDisplay = document.createElement('span');
    this.comboDisplay.className = 'combo-value';
    scoreCard.appendChild(this.comboDisplay);
    const comboMeter = document.createElement('span');
    comboMeter.className = 'combo-meter';
    this.comboMeterFill = document.createElement('span');
    this.comboMeterFill.className = 'combo-meter-fill';
    comboMeter.appendChild(this.comboMeterFill);
    scoreCard.appendChild(comboMeter);

    hud.append(mission, timerCard, scoreCard);
    stage.appendChild(hud);
    this.boostButton = document.createElement('button');
    this.boostButton.type = 'button';
    this.boostButton.className = 'boost-button';
    this.boostButton.setAttribute('aria-label', 'Shelf boost');
    this.boostButton.addEventListener('click', () => this.activateBoost());
    stage.appendChild(this.boostButton);
    this.updateRoundTimer();
    this.updateScoreDisplay();
    this.updateComboDisplay();
    this.updateBoostButton();
    this.showRoundOverlay('ready');
  }

  private showRoundOverlay(phase: 'ready' | 'paused' | 'won' | 'lost'): void {
    const stage = this.container.closest('.game-stage') ?? this.container.parentElement;
    if (!stage) {
      return;
    }

    this.roundOverlay?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'round-overlay';
    overlay.dataset.phase = phase;

    const panel = document.createElement('div');
    panel.className = 'round-panel';

    if (phase === 'ready') {
      panel.innerHTML = `
        <p class="eyebrow">MARTY'S MARKET · ORDER ${this.orderNumber}</p>
        <h1 class="game-title">Grocery Rush</h1>
        <div class="customer-card">
          <span class="customer-label">CUSTOMER</span>
          <img class="customer-avatar" src="./customer-avatars/${this.customer.avatar}" alt="${this.customer.name} avatar">
          <strong class="customer-name">${this.customer.name}</strong>
          <span class="customer-request">${this.customer.request}</span>
        </div>
        <p class="round-story">Find all ${this.shoppingListSize} items, then return to the floor checkout before the doors close. Fast pickups build a score combo.</p>
        <p class="run-record">ORDER ${this.orderNumber} · BEST ${this.bestScore}</p>
        <p class="shift-total">SHIFT SCORE · ${this.formatScore(this.shiftScore)}</p>
        <p class="shift-record">BEST SHIFT · ${this.formatScore(this.bestShiftScore)}</p>
        <p class="shift-progress">${this.isFinalOrder ? 'FINAL ORDER · CLOSE THE SHIFT' : `SHIFT PROGRESS · ${this.orderNumber}/${this.customers.length}`}</p>
        <div class="control-hints" aria-label="Controls">
          <span><b>Arrow keys</b> or <b>WASD</b> to run the shelves</span>
          <span><b>Space</b> for a shelf boost</span>
          <span><b>Swipe</b> on touch screens</span>
        </div>
      `;
      const startButton = document.createElement('button');
      startButton.type = 'button';
      startButton.className = 'start-game-button';
      startButton.innerHTML = 'Start the rush <span class="button-key">Space</span>';
      startButton.setAttribute('aria-keyshortcuts', 'Space');
      startButton.addEventListener('click', () => this.startRound());
      panel.appendChild(startButton);
    } else if (phase === 'paused') {
      panel.innerHTML = `
        <p class="eyebrow">SHIFT ON HOLD</p>
        <h2 class="round-title">Take a breather</h2>
        <p class="round-story">The closing clock is stopped. Your route is waiting.</p>
      `;
      const resumeButton = document.createElement('button');
      resumeButton.type = 'button';
      resumeButton.className = 'resume-game-button';
      resumeButton.innerHTML = 'Resume rush <span class="button-key">Space</span>';
      resumeButton.setAttribute('aria-keyshortcuts', 'Space');
      resumeButton.addEventListener('click', () => this.resumeRound());
      panel.appendChild(resumeButton);
    } else {
      const won = phase === 'won';
      const shiftComplete = won && this.isFinalOrder;
      const missedCheckout = !won && this.shoppingListCollectedCount >= this.shoppingListSize;
      const lossStory = missedCheckout
        ? `Order packed, but you didn't reach checkout before closing.`
        : `You found ${this.shoppingListCollectedCount} of ${this.shoppingListSize} items. Try a faster route.`;
      panel.innerHTML = `
        <p class="eyebrow">${shiftComplete ? 'SHIFT COMPLETE' : won ? 'ORDER COMPLETE' : 'STORE CLOSED'}</p>
        <h2 class="round-title">${shiftComplete ? 'All twenty orders delivered!' : won ? 'Packed with time to spare!' : missedCheckout ? 'Checkout closed without the order.' : 'The last bell rang.'}</h2>
        <p class="round-story">${won ? `You packed order ${this.orderNumber} for ${this.score} points.` : lossStory}</p>
        ${!won ? `<p class="loss-score">RUN SCORE · ${this.formatScore(this.score)}</p>` : ''}
        ${won ? `<p class="customer-payoff">${this.customer.payoff}</p>` : ''}
        ${won ? `
          <div class="checkout-breakdown" aria-label="Checkout breakdown">
            <span class="checkout-chain">BEST CHAIN · ×${Math.max(1, this.maxComboCount)}</span>
            <span class="checkout-coupon">COUPON · ${this.bonusCouponCollected ? '+3s' : 'MISSED'}</span>
            <span class="checkout-mistakes">MISTAKES · ${this.hazardHitCount + this.stockCartHitCount + this.fallCount}</span>
          </div>
        ` : ''}
        ${won && !shiftComplete ? `<p class="shift-total">SHIFT SCORE · ${this.formatScore(this.shiftScore)}</p>` : ''}
        ${shiftComplete ? `
          <div class="campaign-finale" aria-label="${this.customers.length}-order shift complete">
            <strong>${this.customers.length}/${this.customers.length} ORDERS DELIVERED</strong>
            <span class="campaign-final-score">FINAL SHIFT · ${this.formatScore(this.shiftScore)}</span>
            <span class="campaign-best-score">BEST SHIFT · ${this.formatScore(this.bestShiftScore)}</span>
            <small class="campaign-restart-note">Another shift starts at order 1. Your best scores stay saved.</small>
          </div>
        ` : ''}
        <p class="run-record">ORDER ${this.orderNumber} BEST ${this.bestScore}</p>
      `;
      const restartButton = document.createElement('button');
      restartButton.type = 'button';
      restartButton.className = 'restart-game-button';
      const restartLabel = won ? (this.isFinalOrder ? `Start another ${this.customers.length}-order shift` : 'Next order') : 'Try again';
      restartButton.innerHTML = `${restartLabel} <span class="button-key">Space</span>`;
      restartButton.setAttribute('aria-keyshortcuts', 'Space');
      restartButton.addEventListener('click', () => {
        if (won) {
          if (this.isFinalOrder) {
            this.writeStoredInteger('grocery-rush-shift-score', 0);
            this.writeStoredInteger('grocery-rush-credited-order', 0);
          }
          this.writeStoredInteger('grocery-rush-order', this.isFinalOrder ? 1 : this.orderNumber + 1);
        }
        window.location.reload();
      });
      panel.appendChild(restartButton);

      if (won) {
        const shareButton = document.createElement('button');
        shareButton.type = 'button';
        shareButton.className = 'share-score-button';
        shareButton.textContent = 'Share score';
        shareButton.addEventListener('click', () => void this.shareScore(shareButton));
        panel.appendChild(shareButton);
      }

      const resetMapLink = document.createElement('a');
      resetMapLink.className = 'result-reset-map-link';
      resetMapLink.href = 'https://www.prosperprivately.com/moveoncue?utm_source=grocery-rush';
      resetMapLink.target = '_blank';
      resetMapLink.rel = 'noopener';
      const resetMapPrompt = document.createElement('span');
      resetMapPrompt.className = 'result-reset-map-prompt';
      resetMapPrompt.textContent = this.resetMapPrompt;
      resetMapLink.append(resetMapPrompt);
      panel.appendChild(resetMapLink);
    }

    overlay.appendChild(panel);
    stage.appendChild(overlay);
    this.roundOverlay = overlay;
  }

  private async shareScore(button: HTMLButtonElement): Promise<void> {
    const gameUrl = new URL('.', window.location.href).href;
    const shareData: ShareData = {
      title: 'Grocery Rush',
      text: `I scored ${this.formatScore(this.score)} on order ${this.orderNumber} in Grocery Rush. Can you beat my route?`,
      url: gameUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        button.blur();
        return;
      }

      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      button.textContent = 'Score copied';
      button.blur();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      button.textContent = 'Share unavailable';
    }
  }


  private startRound(): void {
    if (this.gamePhase !== 'ready') {
      return;
    }

    this.gamePhase = 'playing';
    this.roundOverlay?.remove();
    this.roundOverlay = null;
    this.ensureAudioContext();
    this.playTone(440, 0.08, 'square', 0.025);
    this.startMusicPulse();
    this.updateUtilityControls();
  }

  private pauseRound(): void {
    if (this.gamePhase !== 'playing') {
      return;
    }

    this.gamePhase = 'paused';
    this.direction = '';
    this.pressedDirections.clear();
    this.stopMusicPulse();
    this.showRoundOverlay('paused');
    this.updateUtilityControls();
  }

  private resumeRound(): void {
    if (this.gamePhase !== 'paused') {
      return;
    }

    this.gamePhase = 'playing';
    this.roundOverlay?.remove();
    this.roundOverlay = null;
    this.lastTime = performance.now();
    this.startMusicPulse();
    this.updateUtilityControls();
  }

  private activateBoost(): void {
    if (this.gamePhase !== 'playing' || this.boostCooldownRemainingMs > 0) {
      return;
    }

    this.boostRemainingMs = this.boostDurationMs;
    this.boostCooldownRemainingMs = this.boostCooldownMs;
    this.character.classList.add('is-boosting');
    this.playTone(320, 0.08, 'square', 0.025);
    this.playTone(620, 0.1, 'square', 0.025, 0.06);
    this.updateBoostButton();
  }

  private updateBoostButton(): void {
    if (!this.boostButton) {
      return;
    }

    const ready = this.gamePhase === 'playing' && this.boostCooldownRemainingMs <= 0;
    this.boostButton.disabled = !ready;
    this.boostButton.classList.toggle('is-ready', ready);
    this.boostButton.innerHTML = ready
      ? '<span class="boost-key">SPACE</span><strong>BOOST</strong>'
      : `<span class="boost-key">${Math.ceil(this.boostCooldownRemainingMs / 1000)}</span><strong>${this.gamePhase === 'playing' ? 'RECHARGING' : 'BOOST'}</strong>`;
    const progress = this.boostCooldownMs > 0
      ? Math.max(0, 1 - this.boostCooldownRemainingMs / this.boostCooldownMs)
      : 1;
    this.boostButton.style.setProperty('--boost-charge', String(progress));
  }

  private setupUtilityControls(): void {
    this.pauseButton = document.querySelector<HTMLButtonElement>('#pause-game-button');
    this.soundButton = document.querySelector<HTMLButtonElement>('#sound-game-button');
    if (this.pauseButton) {
      this.pauseButton.onclick = () => {
        if (this.gamePhase === 'paused') {
          this.resumeRound();
        } else {
          this.pauseRound();
        }
      };
    }
    if (this.soundButton) {
      this.soundButton.onclick = () => {
        this.isMuted = !this.isMuted;
        this.writeStoredInteger('grocery-rush-muted', this.isMuted ? 1 : 0);
        this.updateUtilityControls();
        if (this.isMuted) {
          this.stopMusicPulse();
        } else if (this.gamePhase === 'playing') {
          this.playTone(520, 0.08, 'square', 0.025);
          this.startMusicPulse();
        }
      };
    }
    this.updateUtilityControls();
  }

  private updateUtilityControls(): void {
    if (this.pauseButton) {
      const canPause = this.gamePhase === 'playing' || this.gamePhase === 'paused';
      this.pauseButton.disabled = !canPause;
      this.pauseButton.textContent = this.gamePhase === 'paused' ? 'Resume' : 'Pause';
    }
    if (this.soundButton) {
      this.soundButton.textContent = this.isMuted ? 'Sound off' : 'Sound on';
      this.soundButton.setAttribute('aria-pressed', String(this.isMuted));
    }
    this.updateBoostButton();
  }

  private finishRound(result: 'won' | 'lost'): void {
    if (this.gamePhase === 'won' || this.gamePhase === 'lost') {
      return;
    }

    this.gamePhase = result;
    this.direction = '';
    this.pressedDirections.clear();
    this.stopMusicPulse();
    this.updateUtilityControls();
    if (result === 'won') {
      this.score += Math.ceil(this.roundRemainingMs / 100) * 5;
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        this.writeStoredInteger(`grocery-rush-best-order-${this.orderNumber}`, this.bestScore);
      }
      if (this.orderNumber > this.creditedOrderNumber) {
        this.shiftScore += this.score;
        this.creditedOrderNumber = this.orderNumber;
        this.writeStoredInteger('grocery-rush-shift-score', this.shiftScore);
        this.writeStoredInteger('grocery-rush-credited-order', this.creditedOrderNumber);
        if (this.isFinalOrder && this.shiftScore > this.bestShiftScore) {
          this.bestShiftScore = this.shiftScore;
          this.writeStoredInteger('grocery-rush-best-shift', this.bestShiftScore);
        }
      }
      this.updateScoreDisplay();
      this.playSuccessJingle();
    } else {
      this.playTone(130, 0.35, 'sawtooth', 0.035);
    }
    this.showRoundOverlay(result);
  }

  private updateRoundTimer(): void {
    if (!this.roundTimer) {
      return;
    }

    const seconds = Math.ceil(this.roundRemainingMs / 1000);
    this.roundTimer.textContent = `0:${String(seconds).padStart(2, '0')}`;
    this.roundTimer.classList.toggle('is-urgent', seconds <= 10);
  }

  private updateScoreDisplay(): void {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = String(this.score).padStart(4, '0');
    }
  }

  private formatScore(value: number): string {
    return value.toLocaleString('en-US');
  }

  private updateComboDisplay(): void {
    if (!this.comboDisplay) {
      return;
    }

    this.comboDisplay.textContent = this.comboCount > 0
      ? `×${this.comboCount} ${this.comboCount > 1 ? 'FAST ROUTE' : 'KEEP MOVING'}`
      : 'ROUTE READY';
    this.comboDisplay.classList.toggle('is-hot', this.comboCount > 1);
    this.updateComboMeter();
  }

  private updateComboMeter(): void {
    if (!this.comboMeterFill) {
      return;
    }
    const remainingRatio = this.comboCount > 0 && this.lastPickupAt > 0
      ? Math.max(0, 1 - (performance.now() - this.lastPickupAt) / this.comboWindowMs)
      : 0;
    this.comboMeterFill.style.transform = `scaleX(${remainingRatio})`;
  }

  private readStoredInteger(key: string, fallback: number, minimum: number, maximum: number): number {
    try {
      const parsed = Number.parseInt(window.localStorage.getItem(key) ?? '', 10);
      return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeStoredInteger(key: string, value: number): void {
    try {
      window.localStorage.setItem(key, String(value));
    } catch {
      // Storage may be unavailable in restrictive browser modes; the round remains playable.
    }
  }

  private renderShelfEmptySlots(): void {
    const slotLayer = document.createElement('div');
    slotLayer.className = 'shelf-empty-slots';

    const containerWidth = this.gridWidth * this.config.cellSize;
    const containerHeight = this.gridHeight * this.config.cellSize;

    this.shelfProducts.forEach((productConfig) => {
      const slot = document.createElement('div');
      slot.className = `shelf-empty-slot shelf-empty-slot-row-${productConfig.shelfIndex}`;

      const width = Math.round(productConfig.widthCells * this.config.cellSize) + 2;
      const height = Math.round(productConfig.heightCells * this.config.cellSize) + 2;
      const x = Math.round(productConfig.xCells * this.config.cellSize) - 1;
      const y =
        Math.round(
          this.shelfRowsToPixelY(productConfig.shelfIndex) -
            productConfig.heightCells * this.config.cellSize
        ) - 1;

      slot.style.width = `${Math.max(1, Math.min(width, containerWidth - x))}px`;
      slot.style.height = `${Math.max(1, Math.min(height, containerHeight - y))}px`;
      slot.style.left = `${Math.max(0, x)}px`;
      slot.style.top = `${Math.max(0, y)}px`;

      slotLayer.appendChild(slot);
    });

    this.container.appendChild(slotLayer);
  }

  private renderShelfProducts(): void {
    const productLayer = document.createElement('div');
    productLayer.className = 'shelf-products';

    this.renderedShelfProductElements = new Map<string, HTMLDivElement>();

    const stockKinds = this.shuffleProducts([
      ...this.allShelfProductKinds,
      ...this.allShelfProductKinds,
    ]);

    this.shelfProducts.forEach((productConfig, index) => {
      const kind = stockKinds[index % stockKinds.length];

      const product = document.createElement('div');
      const productId = String(index);
      product.className = `shelf-product shelf-product-${kind} shelf-product-${index} shelf-product-row-${productConfig.shelfIndex}`;
      product.dataset.productId = productId;
      product.dataset.productKind = kind;
      product.dataset.shelfIndex = String(productConfig.shelfIndex);
      product.dataset.shelfY = String(this.shelfRowsToPixelY(productConfig.shelfIndex));
      product.style.backgroundImage = `url('./products/${kind}.png')`;
      product.style.width = `${Math.round(productConfig.widthCells * this.config.cellSize)}px`;
      product.style.height = `${Math.round(productConfig.heightCells * this.config.cellSize)}px`;
      product.style.left = `${Math.round(productConfig.xCells * this.config.cellSize)}px`;
      product.style.top = `${Math.round(
        this.shelfRowsToPixelY(productConfig.shelfIndex) - productConfig.heightCells * this.config.cellSize
      )}px`;

      productLayer.appendChild(product);
      this.renderedShelfProductElements.set(productId, product);
    });

    this.container.appendChild(productLayer);
  }

  private renderShoppingList(): void {
    this.shoppingListEntries = [];

    const shoppingList = document.createElement('div');
    shoppingList.className = 'shopping-list';
    const candidateProducts = Array.from(this.renderedShelfProductElements.values());
    const selectedProducts = this.selectDistinctProductKinds(candidateProducts, this.shoppingListSize);

    selectedProducts.forEach((product, index) => {
      const kind = product.dataset.productKind as ShelfProductKind;
      const productId = product.dataset.productId || '';

      const listItem = document.createElement('div');
      listItem.className = `shopping-list-item shopping-list-product shelf-product-${kind}`;
      listItem.dataset.productId = productId;
      listItem.setAttribute('data-product-kind', kind);
      listItem.dataset.shelfIndex = product.dataset.shelfIndex || '0';
      listItem.style.backgroundImage = `url('./products/${kind}.png')`;

      const checkMark = document.createElement('span');
      checkMark.className = 'shopping-list-check';
      checkMark.textContent = '✓';
      listItem.appendChild(checkMark);

      this.shoppingListEntries.push({
        node: listItem,
        productKind: kind,
        productId,
        collected: false,
      });

      shoppingList.appendChild(listItem);
    });

    const wantedKinds = new Set(this.shoppingListEntries.map((entry) => entry.productKind));
    this.renderedShelfProductElements.forEach((product) => {
      product.classList.toggle('is-wanted', wantedKinds.has(product.dataset.productKind as ShelfProductKind));
    });

    this.shoppingListContainer = shoppingList;
    this.container.appendChild(shoppingList);
    this.updateShoppingListCounter();
    this.updateRouteTarget();
  }

  private updateRouteTarget(): void {
    const outstandingKinds = new Set(
      this.shoppingListEntries.filter((entry) => !entry.collected).map((entry) => entry.productKind)
    );
    let nearestProduct: HTMLDivElement | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const product of this.renderedShelfProductElements.values()) {
      product.classList.remove('is-route-target');
      if (!outstandingKinds.has(product.dataset.productKind as ShelfProductKind)) {
        continue;
      }
      const shelfIndex = Number(product.dataset.shelfIndex ?? 0);
      const productCenterX = (parseFloat(product.style.left) + parseFloat(product.style.width) / 2) / this.config.cellSize;
      const distance = Math.abs(shelfIndex - this.currentShelfIndex) * this.gridWidth + Math.abs(productCenterX - this.characterX);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestProduct = product;
      }
    }

    if (nearestProduct) {
      nearestProduct.classList.add('is-route-target');
    }
  }

  private updateShoppingListCounter(): void {
    if (!this.shoppingListCounter) {
      return;
    }

    this.shoppingListCounter.textContent = `${this.shoppingListCollectedCount}/${this.getShoppingListTotalCount()}`;
  }

  private getShoppingListTotalCount(): number {
    return Math.max(this.shoppingListEntries.length, this.shoppingListSize);
  }

  private selectRandomProducts(products: HTMLDivElement[], count: number): HTMLDivElement[] {
    const availableProducts = [...products];
    const selectedProducts: HTMLDivElement[] = [];

    const selectionCount = Math.min(count, availableProducts.length);

    for (let index = 0; index < selectionCount; index++) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      const selected = availableProducts.splice(randomIndex, 1)[0];
      selectedProducts.push(selected);
    }

    return selectedProducts;
  }

  private selectDistinctProductKinds(products: HTMLDivElement[], count: number): HTMLDivElement[] {
    const shuffledProducts = this.shuffleProducts(products);
    const selectedProducts: HTMLDivElement[] = [];
    const selectedKinds = new Set<string>();

    for (const product of shuffledProducts) {
      const kind = product.dataset.productKind || '';
      if (!kind || selectedKinds.has(kind)) {
        continue;
      }
      selectedProducts.push(product);
      selectedKinds.add(kind);
      if (selectedProducts.length >= count) {
        break;
      }
    }

    return selectedProducts;
  }

  private shuffleProducts<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }

  private characterDirectionX(): number {
    if (this.pressedDirections.has('right')) return 1;
    if (this.pressedDirections.has('left')) return -1;
    return this.direction === 'right' ? 1 : this.direction === 'left' ? -1 : 0;
  }

  private characterDirectionY(): number {
    if (this.pressedDirections.has('down')) return 1;
    if (this.pressedDirections.has('up')) return -1;
    return this.direction === 'down' ? 1 : this.direction === 'up' ? -1 : 0;
  }

  private getHorizontalBounds(shelfIndex: number): { minX: number; maxX: number } {
    const characterInsetCells = Math.max(0, (this.characterWidthCells - 1) / 2);
    if (shelfIndex === this.floorShelfIndex) {
      return {
        minX: characterInsetCells,
        maxX: this.gridWidth - 1 - characterInsetCells,
      };
    }

    return {
      minX: 0.5,
      maxX: 13.75,
    };
  }

  private updateCharacterPosition(): void {
    const characterWidth = this.character.offsetWidth;
    const characterHeight = this.character.offsetHeight;
    const x = (this.config.cellSize - characterWidth) / 2 + this.characterX * this.config.cellSize;
    const y = (this.config.cellSize - characterHeight) / 2 + this.characterY * this.config.cellSize;

    this.character.style.left = `${Math.round(x)}px`;
    this.character.style.top = `${Math.round(y)}px`;
    this.character.dataset.shelfIndex = String(this.currentShelfIndex);
  }

  private draw(): void {
    const { minX, maxX } = this.getHorizontalBounds(this.currentShelfIndex);
    const minShelfY = this.shelfRowsToCharacterY(0);
    const maxShelfY = this.shelfRowsToCharacterY(this.shelfRows.length - 1);

    this.characterX = Math.max(minX, Math.min(maxX, this.characterX));
    this.characterY = Math.max(minShelfY, Math.min(maxShelfY, this.characterY));

    if (!this.isJumping && !this.isFalling) {
      this.characterY = this.shelfRowsToCharacterY(this.currentShelfIndex);
    }

    this.updateCharacterPosition();
    if (!this.canCollectShoppingList && this.direction !== '') {
      this.canCollectShoppingList = true;
    }

    if (this.gamePhase === 'playing' && !this.isFalling) {
      this.handleCheckoutCompletion();
      if (this.canCollectShoppingList) {
        this.handleShoppingListCollection();
        this.handleBonusCouponCollection();
        this.handleAisleHazards();
      }
    }
  }

  private renderBonusCoupon(): void {
    const safeRows = [1, 2, 3, 4];
    const shelfIndex = safeRows[Math.floor(Math.random() * safeRows.length)];
    const coupon = document.createElement('div');
    coupon.className = 'bonus-coupon';
    coupon.dataset.shelfIndex = String(shelfIndex);
    coupon.style.left = '525px';
    coupon.style.top = `${Math.round(this.shelfRowsToPixelY(shelfIndex) - 31)}px`;
    coupon.innerHTML = '<span>+3s</span><strong>COUPON</strong>';
    this.container.appendChild(coupon);
    this.bonusCoupon = coupon;
  }

  private handleBonusCouponCollection(): void {
    if (!this.bonusCoupon || this.bonusCouponCollected || this.isJumping) {
      return;
    }
    const couponShelfIndex = Number(this.bonusCoupon.dataset.shelfIndex);
    if (couponShelfIndex !== this.currentShelfIndex) {
      return;
    }
    if (!this.rectsOverlapWithTolerance(this.character.getBoundingClientRect(), this.bonusCoupon.getBoundingClientRect(), 5)) {
      return;
    }

    this.bonusCouponCollected = true;
    this.score += 2_500;
    this.roundRemainingMs += 3_000;
    this.updateScoreDisplay();
    this.updateRoundTimer();
    this.bonusCoupon.classList.add('is-collected');
    const feedback = document.createElement('div');
    feedback.className = 'bonus-feedback';
    feedback.textContent = 'COUPON! +2500 · +3 SECONDS';
    this.container.appendChild(feedback);
    this.playTone(720, 0.1, 'square', 0.03);
    this.playTone(960, 0.13, 'square', 0.03, 0.08);
    window.setTimeout(() => feedback.remove(), 1_200);
  }

  private renderStockCart(): void {
    if (this.orderNumber < 2) {
      return;
    }
    const cart = document.createElement('div');
    cart.className = 'stock-cart';
    cart.dataset.state = 'warning';
    cart.dataset.shelfIndex = String(this.stockCartShelfIndex);
    cart.innerHTML = '<span class="stock-cart-warning">CART →</span><span class="stock-cart-body"><i></i><b></b><b></b></span>';
    cart.style.top = `${Math.round(this.shelfRowsToPixelY(this.stockCartShelfIndex) - 34)}px`;
    cart.style.left = `${Math.round(this.stockCartX * this.config.cellSize)}px`;
    this.container.appendChild(cart);
    this.stockCart = cart;
  }

  private updateStockCart(dt: number): void {
    if (!this.stockCart) {
      return;
    }
    this.stockCartElapsedMs += dt;
    if (this.stockCartState === 'warning') {
      if (this.stockCartElapsedMs >= 1_350) {
        this.stockCartState = 'crossing';
        this.stockCartElapsedMs = 0;
        this.stockCart.dataset.state = 'crossing';
        this.stockCartCollisionArmed = true;
      }
      return;
    }
    if (this.stockCartState === 'crossing') {
      const speedCellsPerSecond = 3.7 + this.orderNumber * 0.18;
      this.stockCartX += this.stockCartDirection * speedCellsPerSecond * dt / 1000;
      this.stockCart.style.left = `${Math.round(this.stockCartX * this.config.cellSize)}px`;
      this.handleStockCartCollision();
      const crossed = this.stockCartDirection > 0 ? this.stockCartX > this.gridWidth + 1 : this.stockCartX < -1.5;
      if (crossed) {
        this.stockCartState = 'cooldown';
        this.stockCartElapsedMs = 0;
        this.stockCart.dataset.state = 'cooldown';
      }
      return;
    }
    if (this.stockCartElapsedMs >= 2_400) {
      this.stockCartDirection = this.stockCartDirection === 1 ? -1 : 1;
      this.stockCartX = this.stockCartDirection > 0 ? -1.4 : this.gridWidth + 1;
      this.stockCart.style.left = `${Math.round(this.stockCartX * this.config.cellSize)}px`;
      this.stockCartState = 'warning';
      this.stockCartElapsedMs = 0;
      this.stockCart.dataset.state = 'warning';
      const warning = this.stockCart.querySelector('.stock-cart-warning');
      if (warning) warning.textContent = this.stockCartDirection > 0 ? 'CART →' : '← CART';
    }
  }

  private handleStockCartCollision(): void {
    if (
      !this.stockCart ||
      !this.stockCartCollisionArmed ||
      this.stumbleRemainingMs > 0 ||
      this.isFalling ||
      this.isJumping ||
      this.currentShelfIndex !== this.stockCartShelfIndex
    ) {
      return;
    }
    if (!this.rectsOverlapWithTolerance(this.character.getBoundingClientRect(), this.stockCart.getBoundingClientRect(), 1)) {
      return;
    }
    if (this.boostRemainingMs > 0) {
      this.stockCartCollisionArmed = false;
      return;
    }
    this.stumbleRemainingMs = 520;
    this.stockCartCollisionArmed = false;
    this.stockCartHitCount += 1;
    this.container.dataset.cartHits = String(this.stockCartHitCount);
    this.character.classList.add('is-stumbling');
    this.comboCount = 0;
    this.lastPickupAt = 0;
    this.updateComboDisplay();
    this.playTone(120, 0.2, 'sawtooth', 0.024);
  }

  private renderAisleHazards(): void {
    const hazardCount = this.orderNumber >= 5 ? 2 : this.orderNumber >= 3 ? 1 : 0;
    const safeSlotsByRow = [1, 3].map((shelfIndex) => {
      const rowProducts = [...this.renderedShelfProductElements.values()]
        .filter((product) => Number(product.dataset.shelfIndex) === shelfIndex)
        .map((product) => {
          const left = parseFloat(product.style.left);
          const right = left + parseFloat(product.style.width);
          return { left, right };
        })
        .sort((a, b) => a.left - b.left);
      const candidates = [230, 330, 430, 130];
      const x = candidates.find((candidate) =>
        rowProducts.every((product) => candidate + 34 <= product.left - 8 || candidate >= product.right + 8)
      ) ?? 230;
      return { shelfIndex, x };
    });
    this.aisleHazards = safeSlotsByRow.slice(0, hazardCount).map(({ shelfIndex, x }, index) => {
      const hazard = document.createElement('div');
      hazard.className = 'aisle-hazard';
      hazard.dataset.shelfIndex = String(shelfIndex);
      hazard.dataset.hazardId = String(index);
      hazard.style.left = `${x}px`;
      hazard.style.top = `${Math.round(this.shelfRowsToPixelY(shelfIndex) - 15)}px`;
      hazard.innerHTML = '<span>!</span>';
      this.container.appendChild(hazard);
      return hazard;
    });
  }

  private handleAisleHazards(): void {
    if (this.isJumping) {
      return;
    }
    const characterRect = this.character.getBoundingClientRect();
    for (const hazard of this.aisleHazards) {
      if (hazard.classList.contains('is-cleared') || Number(hazard.dataset.shelfIndex) !== this.currentShelfIndex) {
        continue;
      }
      if (!this.rectsOverlapWithTolerance(characterRect, hazard.getBoundingClientRect(), 3)) {
        continue;
      }

      hazard.classList.add('is-cleared');
      this.hazardHitCount += 1;
      this.container.dataset.hazardHits = String(this.hazardHitCount);
      this.roundRemainingMs = Math.max(0, this.roundRemainingMs - 2_000);
      this.comboCount = 0;
      this.lastPickupAt = 0;
      this.updateRoundTimer();
      this.updateComboDisplay();
      const feedback = document.createElement('div');
      feedback.className = 'hazard-feedback';
      feedback.textContent = 'SHELF SPILL! · -2 SECONDS';
      this.container.appendChild(feedback);
      this.playTone(155, 0.18, 'sawtooth', 0.025);
      window.setTimeout(() => feedback.remove(), 1_100);
      break;
    }
  }

  private handleShoppingListCollection(): void {
    if (!this.shoppingListContainer || this.shoppingListEntries.length === 0) {
      return;
    }

    if (this.isJumping) {
      return;
    }

    const characterRect = this.character.getBoundingClientRect();
    const characterShelfIndex = this.resolveCurrentShelfIndex();
    if (characterShelfIndex === null) {
      return;
    }

    for (const entry of this.shoppingListEntries) {
      if (entry.collected) {
        continue;
      }

      const matchingProducts = this.getShelfProductsByKind(entry.productKind);
      if (matchingProducts.length === 0) {
        this.markShoppingListEntryCollected(entry);
        continue;
      }

      const rowProducts = matchingProducts.filter((product) => {
        const shelfRow = Number(product.dataset.shelfIndex || Number.NaN);
        return Number.isFinite(shelfRow) && shelfRow === characterShelfIndex;
      });


      if (rowProducts.length === 0) {
        continue;
      }

      const overlappingProduct = this.findOverlappingShelfProductOnRow(rowProducts, characterRect);
      if (!overlappingProduct) {
        continue;
      }

      this.collectShoppingListEntry(entry, overlappingProduct);
      break;
    }
  }

  private findOverlappingShelfProductOnRow(
    shelfProducts: HTMLDivElement[],
    characterRect: DOMRect
  ): HTMLDivElement | null {
    let nearestProduct: HTMLDivElement | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const shelfProduct of shelfProducts) {
      const productRect = shelfProduct.getBoundingClientRect();
      if (!this.rectsOverlapWithTolerance(characterRect, productRect, this.collisionTolerance)) {
        continue;
      }

      if (!this.rectsOverlapVertically(characterRect, productRect)) {
        continue;
      }

      const productDistance = this.getRectDistance(characterRect, productRect);
      if (productDistance < nearestDistance) {
        nearestDistance = productDistance;
        nearestProduct = shelfProduct;
      }
    }

    return nearestProduct;
  }

  private resolveCurrentShelfIndex(): number | null {
    const roundedShelfIndex = Math.round(this.currentShelfIndex);
    if (!Number.isInteger(roundedShelfIndex)) {
      return null;
    }

    if (roundedShelfIndex < 0 || roundedShelfIndex >= this.shelfRows.length) {
      return null;
    }

    return roundedShelfIndex;
  }

  private getRectDistance(firstRect: DOMRect, secondRect: DOMRect): number {
    const firstCenterX = (firstRect.left + firstRect.right) / 2;
    const firstCenterY = (firstRect.top + firstRect.bottom) / 2;
    const secondCenterX = (secondRect.left + secondRect.right) / 2;
    const secondCenterY = (secondRect.top + secondRect.bottom) / 2;

    const deltaX = Math.abs(firstCenterX - secondCenterX);
    const deltaY = Math.abs(firstCenterY - secondCenterY);

    return deltaX + deltaY;
    }

  private getShelfProductsByKind(productKind: ShelfProductKind): HTMLDivElement[] {
    const products: HTMLDivElement[] = [];

    this.renderedShelfProductElements.forEach((product) => {
      if (product.dataset.productKind === productKind) {
        products.push(product);
      }
    });

    return products;
  }

  private collectShoppingListEntry(entry: { node: HTMLDivElement; productKind: ShelfProductKind; productId: string; collected: boolean }, shelfProduct: HTMLDivElement): void {
    this.markShoppingListEntryCollected(entry);
    const shelfProductId = shelfProduct.dataset.productId;
    if (shelfProductId) {
      this.renderedShelfProductElements.delete(shelfProductId);
    }

    this.animateCollectedProductToShoppingList(shelfProduct, entry.node);

    shelfProduct.style.transition = 'opacity 140ms linear';
    shelfProduct.style.opacity = '0';
    window.setTimeout(() => {
      shelfProduct.remove();
    }, 140);
  }

  private markShoppingListEntryCollected(entry: { node: HTMLDivElement; productKind: ShelfProductKind; productId: string; collected: boolean }): void {
    if (entry.collected) {
      return;
    }

    entry.collected = true;
    this.shoppingListCollectedCount += 1;
    const pickupTime = performance.now();
    this.comboCount = this.lastPickupAt > 0 && pickupTime - this.lastPickupAt <= this.comboWindowMs
      ? Math.min(5, this.comboCount + 1)
      : 1;
    this.maxComboCount = Math.max(this.maxComboCount, this.comboCount);
    this.lastPickupAt = pickupTime;
    const pickupScore = (1_000 + this.shoppingListCollectedCount * 100) * this.comboCount;
    this.score += pickupScore;
    this.updateShoppingListCounter();
    this.updateScoreDisplay();
    this.updateComboDisplay();
    entry.node.classList.add('is-collected');
    this.getShelfProductsByKind(entry.productKind).forEach((product) => product.classList.remove('is-wanted'));
    this.updateRouteTarget();
    this.container.classList.remove('pickup-pulse');
    void this.container.offsetWidth;
    this.container.classList.add('pickup-pulse');
    this.spawnPickupFeedback(pickupScore);
    this.playTone(540 + this.shoppingListCollectedCount * 80, 0.1, 'square', 0.035);

    if (this.shoppingListCollectedCount >= this.shoppingListSize) {
      this.activateCheckout();
    }
  }

  private activateCheckout(): void {
    if (this.checkoutReady) {
      return;
    }

    this.checkoutReady = true;
    this.container.dataset.objective = 'checkout';
    if (this.shoppingListCounter) {
      this.shoppingListCounter.textContent = 'CHECKOUT';
    }
    const missionLabel = this.container.closest('.game-stage')?.querySelector<HTMLElement>('.mission-card .hud-label');
    if (missionLabel) {
      missionLabel.textContent = 'RETURN ORDER';
    }

    const checkout = document.createElement('div');
    checkout.className = 'checkout-zone';
    checkout.setAttribute('aria-label', 'Checkout: return the completed order here');
    checkout.style.left = '8px';
    checkout.style.top = `${Math.round(this.shelfRowsToPixelY(this.floorShelfIndex) - 52)}px`;
    checkout.innerHTML = '<span>✓</span><strong>CHECKOUT</strong><small>RETURN HERE</small>';
    this.container.appendChild(checkout);
    this.checkoutZone = checkout;
    this.playTone(760, 0.1, 'square', 0.03);
    this.playTone(920, 0.12, 'square', 0.025, 0.08);
  }

  private handleCheckoutCompletion(): void {
    if (
      !this.checkoutReady ||
      !this.checkoutZone ||
      this.isJumping ||
      this.isFalling ||
      this.currentShelfIndex !== this.floorShelfIndex
    ) {
      return;
    }

    const overlapsCheckout = this.rectsOverlapWithTolerance(
      this.character.getBoundingClientRect(),
      this.checkoutZone.getBoundingClientRect(),
      2
    );
    if (!overlapsCheckout) {
      return;
    }

    this.checkoutReady = false;
    this.checkoutZone.classList.add('is-complete');
    window.setTimeout(() => this.finishRound('won'), 180);
  }

  private spawnPickupFeedback(pickupScore: number): void {
    const feedback = document.createElement('div');
    feedback.className = 'pickup-feedback';
    feedback.textContent = `${this.comboCount > 1 ? `×${this.comboCount} COMBO` : 'ITEM FOUND'}  +${pickupScore}`;
    feedback.style.left = `${Math.round(this.characterX * this.config.cellSize)}px`;
    feedback.style.top = `${Math.round(this.characterY * this.config.cellSize)}px`;
    this.container.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 800);
  }

  private ensureAudioContext(): AudioContext | null {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        void this.audioContext.resume();
      }
      return this.audioContext;
    }

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      return null;
    }

    this.audioContext = new AudioContextConstructor();
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    wave: OscillatorType,
    volume: number,
    delaySeconds = 0
  ): void {
    if (this.isMuted) {
      return;
    }
    const context = this.ensureAudioContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delaySeconds;
    const end = start + durationSeconds;
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }

  private playSuccessJingle(): void {
    [660, 825, 990].forEach((frequency, index) => {
      this.playTone(frequency, 0.16, 'square', 0.035, index * 0.11);
    });
  }

  private startMusicPulse(): void {
    this.stopMusicPulse();
    if (this.isMuted || this.gamePhase !== 'playing') {
      return;
    }

    this.container.dataset.musicPulse = 'active';
    const tick = (): void => {
      if (this.isMuted || this.gamePhase !== 'playing') {
        this.stopMusicPulse();
        return;
      }
      const urgent = this.roundRemainingMs <= 10_000;
      const notes = urgent ? [220, 277, 330, 370] : [196, 247, 294, 247];
      this.playTone(notes[this.musicPulseStep % notes.length], 0.055, 'triangle', urgent ? 0.018 : 0.012);
      this.musicPulseStep += 1;
      const delay = urgent ? 310 : this.roundRemainingMs <= 20_000 ? 480 : 720;
      this.container.dataset.musicPulse = urgent ? 'active-urgent' : 'active';
      this.musicPulseTimer = window.setTimeout(tick, delay);
    };
    tick();
  }

  private stopMusicPulse(): void {
    if (this.musicPulseTimer !== null) {
      window.clearTimeout(this.musicPulseTimer);
      this.musicPulseTimer = null;
    }
    this.container.dataset.musicPulse = 'stopped';
  }

  private animateCollectedProductToShoppingList(shelfProduct: HTMLDivElement, listItem: HTMLDivElement): void {
    const startRect = shelfProduct.getBoundingClientRect();
    const endRect = listItem.getBoundingClientRect();

    const flyingProduct = shelfProduct.cloneNode(true) as HTMLDivElement;
    flyingProduct.classList.add('collecting-product');
    flyingProduct.style.position = 'fixed';
    flyingProduct.style.left = `${Math.round(startRect.left)}px`;
    flyingProduct.style.top = `${Math.round(startRect.top)}px`;
    flyingProduct.style.width = `${Math.round(startRect.width)}px`;
    flyingProduct.style.height = `${Math.round(startRect.height)}px`;
    flyingProduct.style.pointerEvents = 'none';
    flyingProduct.style.zIndex = '8';
    flyingProduct.style.opacity = '1';
    flyingProduct.style.transition = `left ${this.collectionAnimationDurationMs}ms ease-in, top ${this.collectionAnimationDurationMs}ms ease-in, opacity ${this.collectionAnimationDurationMs}ms ease-in`;
    flyingProduct.removeAttribute('data-product-id');
    flyingProduct.removeAttribute('data-product-kind');
    flyingProduct.removeAttribute('data-shelf-index');

    document.body.appendChild(flyingProduct);

    requestAnimationFrame(() => {
      flyingProduct.style.left = `${Math.round(endRect.left)}px`;
      flyingProduct.style.top = `${Math.round(endRect.top)}px`;
      flyingProduct.style.opacity = '0';
    });

    const markCollected = (): void => {
      listItem.classList.add('is-collected');
      listItem.style.opacity = '1';
      if (flyingProduct.parentNode) {
        flyingProduct.remove();
      }
      flyingProduct.removeEventListener('transitionend', markCollected);
    };

    flyingProduct.addEventListener('transitionend', markCollected);
    window.setTimeout(() => {
      if (!flyingProduct.isConnected) {
        return;
      }
      markCollected();
    }, this.collectionAnimationDurationMs + 30);
  }

  private rectsOverlapWithTolerance(firstRect: DOMRect, secondRect: DOMRect, tolerance: number): boolean {
    return (
      firstRect.left - tolerance <= secondRect.right + tolerance &&
      firstRect.right + tolerance >= secondRect.left - tolerance &&
      firstRect.top - tolerance <= secondRect.bottom + tolerance &&
      firstRect.bottom + tolerance >= secondRect.top - tolerance
    );
  }

  private rectsOverlapVertically(firstRect: DOMRect, secondRect: DOMRect): boolean {
    return firstRect.top <= secondRect.bottom && firstRect.bottom >= secondRect.top;
  }

  private handleTouchStart = (event: TouchEvent): void => {
    if (event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    this.swipeStartX = touch.clientX;
    this.swipeStartY = touch.clientY;
    this.isSwipeActive = true;
    this.clearSwipeDirectionAfterFrame = false;
    this.swipeFollowThroughRemainingMs = 0;
    event.preventDefault();
  };

  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.isSwipeActive || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    this.updateSwipeDirection(touch.clientX, touch.clientY);
    event.preventDefault();
  };

  private handleTouchEnd = (event: TouchEvent): void => {
    if (!this.isSwipeActive) {
      return;
    }

    this.isSwipeActive = false;
    const isHorizontalFlick = this.direction === 'left' || this.direction === 'right';
    this.swipeFollowThroughRemainingMs = isHorizontalFlick ? this.horizontalFlickFollowThroughMs : 0;
    this.clearSwipeDirectionAfterFrame = !!this.direction && !isHorizontalFlick;
    event.preventDefault();
  };


  private handlePointerDown = (event: PointerEvent): void => {
    this.swipeStartX = event.clientX;
    this.swipeStartY = event.clientY;
    this.isSwipeActive = true;
    this.clearSwipeDirectionAfterFrame = false;
    this.swipeFollowThroughRemainingMs = 0;
    event.preventDefault();
  };

  private handlePointerMove = (event: PointerEvent): void => {
    if (!this.isSwipeActive) {
      return;
    }

    this.updateSwipeDirection(event.clientX, event.clientY);
    event.preventDefault();
  };

  private handlePointerEnd = (event: PointerEvent): void => {
    if (!this.isSwipeActive) {
      return;
    }

    this.isSwipeActive = false;
    const isHorizontalFlick = this.direction === 'left' || this.direction === 'right';
    this.swipeFollowThroughRemainingMs = isHorizontalFlick ? this.horizontalFlickFollowThroughMs : 0;
    this.clearSwipeDirectionAfterFrame = !!this.direction && !isHorizontalFlick;
    event.preventDefault();
  };

  private updateSwipeDirection(clientX: number, clientY: number): void {
    const dx = clientX - this.swipeStartX;
    const dy = clientY - this.swipeStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (absX < this.swipeThresholdPixels && absY < this.swipeThresholdPixels) {
      return;
    }

    if (this.gamePhase === 'ready') {
      this.startRound();
    }

    this.direction = absX > absY
      ? dx > 0
        ? 'right'
        : 'left'
      : dy > 0
        ? 'down'
        : 'up';
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (this.gamePhase === 'playing') {
        this.activateBoost();
      } else if (!event.repeat) {
        this.roundOverlay?.querySelector<HTMLButtonElement>('button')?.click();
      }
      return;
    }

    if (event.key === 'Escape' || event.key.toLowerCase() === 'p') {
      event.preventDefault();
      if (this.gamePhase === 'paused') {
        this.resumeRound();
      } else {
        this.pauseRound();
      }
      return;
    }

    const direction = this.getDirectionFromKey(event.key);
    if (!direction) {
      return;
    }

    event.preventDefault();
    if (this.gamePhase === 'ready') {
      this.startRound();
    }
    this.pressedDirections.add(direction as Exclude<Direction, ''>);
    this.direction = direction;
    if (!this.isJumping && (direction === 'up' || direction === 'down')) {
      this.tryStartJump(direction === 'down' ? 1 : -1);
    }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const direction = this.getDirectionFromKey(event.key);
    if (!direction) {
      return;
    }

    event.preventDefault();
    this.pressedDirections.delete(direction as Exclude<Direction, ''>);
    this.direction = [...this.pressedDirections].at(-1) ?? '';
  };

  private getDirectionFromKey(key: string): Direction {
    switch (key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        return 'up';
      case 'arrowdown':
      case 's':
        return 'down';
      case 'arrowleft':
      case 'a':
        return 'left';
      case 'arrowright':
      case 'd':
        return 'right';
      default:
        return '';
    }
  }
}
