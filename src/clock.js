// Types
const CubeOwnership = { None: 0, PlayerOne: 1, PlayerTwo: 2 };

// Config
// eslint-disable-next-line no-unused-vars
const CONFIG = {
  DEFAULT_INITIAL_TIME_MIN: 5,
  DEFAULT_DELAY_SEC: 12,
  DEFAULT_MAX_CUBE: 64,
  DEFAULT_PLAYER_NAME_1: "Player 1",
  DEFAULT_PLAYER_NAME_2: "Player 2",
  UPDATE_INTERVAL_MS: 10,
  ANIMATION_SCALE_DURATION_MS: 150,
  DELAY_LOW_THRESHOLD: 0.3,
  VIBRATE_START: 100,
  VIBRATE_PAUSE: 50,
  VIBRATE_DOUBLE_ACCEPT: [100, 50, 100],
  VIBRATE_DOUBLE_REJECT: [50, 100, 50],
  VIBRATE_RESET: [50, 50],
  VIBRATE_END_MATCH: [100, 50, 100],
};

// eslint-disable-next-line no-unused-vars
const STATE = {
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  DOUBLE: "double",
  ENDED: "ended",
};

// Clock
class Clock {
  constructor(initialTimeMin, delayPerMoveSec = 0) {
    this.initialTimeMs = initialTimeMin * 60 * 1000;
    this.remainingTimeMs = this.initialTimeMs;
    this.delayPerMoveMs = delayPerMoveSec * 1000;
    this.lastTimestamp = null;
    this.moveStartTimestamp = null;
    this.ticking = false;
    this.hasDelay = true;
  }

  start() {
    this.ticking = true;
    this.hasDelay = true;
    const now = Date.now();
    this.lastTimestamp = now;
    this.moveStartTimestamp = now;
  }

  stop() {
    if (!this.ticking || this.lastTimestamp === null) return;
    this.hasDelay = true;
    const elapsed = this.getElapsedSinceLastTimestamp();
    this.remainingTimeMs = Math.max(0, this.remainingTimeMs - elapsed);
    this.ticking = false;
    this.lastTimestamp = null;
    this.moveStartTimestamp = null;
  }

  reset() {
    this.remainingTimeMs = this.initialTimeMs;
    this.ticking = false;
    this.lastTimestamp = null;
    this.moveStartTimestamp = null;
  }

  getInitialTimeMs() {
    return this.initialTimeMs;
  }
  getTimeLeftMs() {
    if (!this.ticking || this.lastTimestamp === null)
      return this.remainingTimeMs;
    const elapsed = this.getElapsedSinceLastTimestamp();
    return Math.max(0, this.remainingTimeMs - elapsed);
  }
  isTimeUp() {
    return this.getTimeLeftMs() === 0;
  }
  getDelayTimeLeftMs() {
    if (
      !this.ticking ||
      !this.moveStartTimestamp ||
      !this.delayPerMoveMs ||
      !this.hasDelay
    )
      return 0;
    return Math.max(
      0,
      this.delayPerMoveMs - (Date.now() - this.moveStartTimestamp),
    );
  }
  getDelayMs() {
    return this.delayPerMoveMs;
  }
  forceNoDelay() {
    this.hasDelay = false;
  }

  getElapsedSinceLastTimestamp() {
    if (!this.ticking || this.lastTimestamp === null) return 0;
    const totalElapsed = Date.now() - this.lastTimestamp;
    if (this.delayPerMoveMs && this.moveStartTimestamp) {
      const moveElapsed = Date.now() - this.moveStartTimestamp;
      if (moveElapsed < this.delayPerMoveMs) return 0;
      return Math.max(0, totalElapsed - this.delayPerMoveMs);
    }
    return totalElapsed;
  }
}

// Player
// eslint-disable-next-line no-unused-vars
class Player {
  constructor(name, initialTimeMin, delayPerMoveSec = 0) {
    this.name = name;
    this.score = 0;
    this.clock = new Clock(initialTimeMin, delayPerMoveSec);
  }
  addPoints(points) {
    this.score += points;
  }
  resetScore() {
    this.score = 0;
  }
  rename(newName) {
    this.name = newName;
  }
}

// DoublingCube
// eslint-disable-next-line no-unused-vars
class DoublingCube {
  constructor(maxValue = 64) {
    this.value = 1;
    this.maxValue = Math.pow(2, Math.floor(Math.log2(Math.min(maxValue, 64))));
    this.ownership = CubeOwnership.None;
  }

  getValue() {
    return this.value;
  }
  getOwnership() {
    return this.ownership;
  }
  canDouble(player) {
    return this.ownership === CubeOwnership.None || this.ownership === player;
  }
  increaseValue() {
    if (this.value * 2 <= this.maxValue) this.value *= 2;
  }
  getMaxValue() {
    return this.maxValue;
  }
  assignOwnership(toPlayer) {
    this.ownership = toPlayer;
  }
  reset() {
    this.value = 1;
    this.ownership = CubeOwnership.None;
  }
}
