// GameEngine
// eslint-disable-next-line no-unused-vars
class GameEngine {
  constructor(
    playerOneName,
    playerTwoName,
    initialTimeMin = 5,
    delayPerMoveSec = 12,
    maxCubeValue = 64,
  ) {
    this.playerOne = new Player(playerOneName, initialTimeMin, delayPerMoveSec);
    this.playerTwo = new Player(playerTwoName, initialTimeMin, delayPerMoveSec);
    this.cube = new DoublingCube(maxCubeValue);
    this.activePlayer = this.playerOne;
    this.isRunning = false;
    this.doubleOffered = false;
  }

  startGame() {
    this.cube.reset();
    this.activePlayer = this.playerOne;
    this.activePlayer.clock.start();
    this.isRunning = true;
  }

  switchTurn() {
    if (!this.isRunning) return;
    if (this.activePlayer.clock.isTimeUp()) {
      this.handleTimeUp();
      return;
    }
    this.activePlayer.clock.stop();
    this.activePlayer = this.getOpponent(this.activePlayer);
    this.activePlayer.clock.start();
  }

  handleTimeUp() {
    this.isRunning = false;
    const winner = this.getOpponent(this.activePlayer);
    winner.addPoints(this.cube.getValue());
    this.endGame();
  }

  offerDouble() {
    const currentOwner = this.cube.getOwnership();
    const playerOwnership = this.getOwnership(this.activePlayer);
    if (
      !(currentOwner === CubeOwnership.None || currentOwner === playerOwnership)
    )
      return false;
    this.doubleOffered = true;
    return true;
  }

  takeDouble() {
    if (!this.doubleOffered) return;
    this.cube.increaseValue();
    this.cube.assignOwnership(this.getOwnership(this.activePlayer));
    this.doubleOffered = false;
  }

  rejectDouble() {
    if (!this.doubleOffered) return 0;
    this.isRunning = false;
    const points = this.cube.getValue();
    this.cube.reset();
    this.getOpponent(this.activePlayer).addPoints(points);
    this.doubleOffered = false;
    this.endGame();
    return points;
  }

  updateSettings(p1, p2, initialTimeMin, delayPerMoveSec, maxCubeValue) {
    this.playerOne = new Player(p1, initialTimeMin, delayPerMoveSec);
    this.playerTwo = new Player(p2, initialTimeMin, delayPerMoveSec);
    this.cube = new DoublingCube(maxCubeValue);
  }

  resetGame() {
    this.isRunning = false;
    this.activePlayer = this.playerOne;
    this.cube.reset();
    this.playerOne.resetScore();
    this.playerTwo.resetScore();
    this.playerOne.clock.reset();
    this.playerTwo.clock.reset();
  }

  getOpponent(player) {
    return player === this.playerOne ? this.playerTwo : this.playerOne;
  }
  getPreviousPlayer() {
    return this.getOpponent(this.activePlayer);
  }
  getOwnership(player) {
    return player === this.playerOne
      ? CubeOwnership.PlayerOne
      : CubeOwnership.PlayerTwo;
  }
  getPlayerOne() {
    return this.playerOne;
  }
  getPlayerTwo() {
    return this.playerTwo;
  }
  getActivePlayer() {
    return this.activePlayer;
  }
  getCubeValue() {
    return this.cube.getValue();
  }
  getCubeOwner() {
    return this.cube.getOwnership();
  }
  getDoublingCube() {
    return this.cube;
  }
  isGameRunning() {
    return this.isRunning;
  }

  endGame() {
    this.playerOne.clock.stop();
    this.playerTwo.clock.stop();
    this.cube.reset();
    this.isRunning = false;
  }
}
