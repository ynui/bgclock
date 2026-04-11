// UI
class GameUI {
  constructor() {
    this.engine = new GameEngine(
      CONFIG.DEFAULT_PLAYER_NAME_1,
      CONFIG.DEFAULT_PLAYER_NAME_2,
    );
    this.isPaused = false;
    this.currentState = STATE.READY;
    this.wakeLock = null;
    this.updateInterval = null;
    this.initElements();
    this.bindEvents();
    this.requestWakeLock();
    this.updateUI();
  }

  initElements() {
    this.player1El = document.getElementById("player-one");
    this.player2El = document.getElementById("player-two");
    this.doubleButton = document.querySelector(".double-button");
    this.gameStateBanner = document.querySelector(".game-state-banner");
    this.stateMessage = document.querySelector(".state-message");
    this.startButton = document.querySelector(".start-button");
    this.pauseButton = document.querySelector(".pause-button");
    this.settingsButton = document.querySelector(".settings-button");
    this.resetButton = document.querySelector(".reset-button");
    this.endMatchButton = document.querySelector(".end-match-button");
    this.fullscreenButton = document.querySelector(".fullscreen-button");
    this.settingsModal = document.getElementById("settings-modal");
    this.saveSettingsButton = document.querySelector(".save-settings");
    this.cancelSettingsButton = document.querySelector(".cancel-settings");
    this.endMatchOverlay = document.getElementById("end-match-overlay");
    this.winnerButtons = document.querySelectorAll(".winner-button");
    this.pointsButtons = document.querySelectorAll(".points-button");
    this.currentCubeValue = document.querySelector(".current-cube-value");
    this.pointsCalculation = document.querySelector(".points-calculation");
    this.confirmEndMatchButton = document.querySelector(".confirm-end-match");
    this.cancelEndMatchButton = document.querySelector(".cancel-end-match");
    this.doubleOfferOverlay = document.getElementById("double-offer-overlay");
    this.takeButton = document.querySelector(".take-button");
    this.passButton = document.querySelector(".pass-button");
    this.timeUpOverlay = document.getElementById("time-up-overlay");
    this.gameResultOverlay = document.getElementById("game-result-overlay");
    this.confirmDialogOverlay = document.getElementById(
      "confirm-dialog-overlay",
    );
    const p1El = this.getPlayerElements(this.engine.getPlayerOne());
    const p2El = this.getPlayerElements(this.engine.getPlayerTwo());
    p1El.querySelector(".player-name").textContent =
      this.engine.getPlayerOne().name;
    p2El.querySelector(".player-name").textContent =
      this.engine.getPlayerTwo().name;
  }

  bindEvents() {
    document.addEventListener("click", (e) => {
      if (
        this.engine.isGameRunning() &&
        !this.isPaused &&
        this.currentState !== STATE.DOUBLE
      ) {
        const target = e.target;
        if (
          !target.closest(".center-controls") &&
          !target.closest(".settings-modal") &&
          !target.closest(".fullscreen-button")
        ) {
          this.engine.switchTurn();
          this.updateUI();
        }
      }
    });

    this.startButton.addEventListener("click", () => this.startGame());
    this.pauseButton.addEventListener("click", () => this.togglePause());
    this.resetButton.addEventListener("click", () => this.resetGame());
    this.endMatchButton.addEventListener("click", () =>
      this.showEndMatchDialog(),
    );
    this.settingsButton.addEventListener("click", () => this.showSettings());
    this.fullscreenButton.addEventListener("click", () =>
      this.toggleFullscreen(),
    );
    this.saveSettingsButton.addEventListener("click", () =>
      this.saveSettings(),
    );
    this.cancelSettingsButton.addEventListener("click", () =>
      this.hideSettings(),
    );

    // Slider event listeners for real-time display updates
    document.getElementById("initial-time-slider").addEventListener("input", () =>
      this.updateSliderDisplays(),
    );
    document.getElementById("delay-slider").addEventListener("input", () =>
      this.updateSliderDisplays(),
    );
    document.getElementById("max-cube-slider").addEventListener("input", () =>
      this.updateSliderDisplays(),
    );

    this.doubleButton.addEventListener("click", () => {
      if (
        this.engine.isGameRunning() &&
        !this.isPaused &&
        !this.doubleButton.disabled
      ) {
        if (this.engine.offerDouble()) {
          this.engine.switchTurn();
          this.showDoubleDialog();
          this.updateUI();
        }
      }
    });

    document
      .querySelectorAll(".game-dialog-overlay .ok-button")
      .forEach((btn) => {
        btn.addEventListener("click", () =>
          btn.closest(".game-dialog-overlay").classList.remove("active"),
        );
      });

    document.addEventListener("keydown", (e) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          if (this.engine.isGameRunning() && !this.isPaused) {
            this.engine.switchTurn();
            this.updateUI();
          }
          break;
        case "enter":
          e.preventDefault();
          if (this.engine.isGameRunning()) this.togglePause();
          else this.startGame();
          break;
        case "r":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.resetGame();
          }
          break;
      }
    });

    this.updateInterval = setInterval(
      () => this.updateClocks(),
      CONFIG.UPDATE_INTERVAL_MS,
    );
  }

  requestWakeLock() {
    if ("wakeLock" in navigator) {
      navigator.wakeLock
        .request("screen")
        .then((lock) => {
          this.wakeLock = lock;
        })
        .catch(() => {});
    }
  }

  startGame() {
    this.engine.startGame();
    this.isPaused = false;
    this.startButton.disabled = true;
    this.pauseButton.disabled = false;
    this.pauseButton.textContent = "Pause";
    this.updateGameState(STATE.RUNNING);
    this.updateUI();
    if ("vibrate" in navigator) navigator.vibrate(CONFIG.VIBRATE_START);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      this.engine.getPlayerOne().clock.stop();
      this.engine.getPlayerTwo().clock.stop();
      this.pauseButton.textContent = "Resume";
      this.updateGameState(STATE.PAUSED);
    } else {
      if (this.engine.isGameRunning()) {
        this.engine.getActivePlayer().clock.start();
        this.updateGameState(STATE.RUNNING);
      }
      this.pauseButton.textContent = "Pause";
    }
    if ("vibrate" in navigator) navigator.vibrate(CONFIG.VIBRATE_PAUSE);
    this.updateUI();
  }

  showSettings() {
    const p1 = this.engine.getPlayerOne();
    const totalSeconds = Math.floor(p1.clock.getInitialTimeMs() / 1000);
    const delaySeconds = Math.floor(p1.clock.getDelayMs() / 1000);
    const maxCube = this.engine.getDoublingCube().getMaxValue();

    document.getElementById("player1-name").value = p1.name;
    document.getElementById("player2-name").value =
      this.engine.getPlayerTwo().name;
    document.getElementById("initial-time-slider").value = totalSeconds;
    document.getElementById("delay-slider").value = delaySeconds;

    // Calculate cube slider value (log2 of cube value)
    const cubeSliderValue = Math.log2(maxCube);
    document.getElementById("max-cube-slider").value = cubeSliderValue;

    this.updateSliderDisplays();
    this.settingsModal.classList.add("active");
  }

  updateSliderDisplays() {
    // Update time slider display
    const timeSlider = document.getElementById("initial-time-slider");
    const timeDisplay = document.querySelector(".time-value-display");
    const totalSeconds = parseInt(timeSlider.value);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    timeDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

    // Update delay slider display
    const delaySlider = document.getElementById("delay-slider");
    const delayDisplay = document.querySelector(".delay-value-display");
    delayDisplay.textContent = delaySlider.value;

    // Update cube slider display (slider 0-5 maps to 2,4,8,16,32,64)
    const cubeSlider = document.getElementById("max-cube-slider");
    const cubeDisplay = document.querySelector(".cube-value-display");
    cubeDisplay.textContent = Math.pow(2, parseInt(cubeSlider.value) + 1);
  }

  hideSettings() {
    this.settingsModal.classList.remove("active");
  }

  saveSettings() {
    const p1Name =
      document.getElementById("player1-name").value ||
      CONFIG.DEFAULT_PLAYER_NAME_1;
    const p2Name =
      document.getElementById("player2-name").value ||
      CONFIG.DEFAULT_PLAYER_NAME_2;

    // Get time from slider (in seconds)
    const totalSeconds = parseInt(document.getElementById("initial-time-slider").value);
    const minutes = Math.floor(totalSeconds / 60);

    // Get delay from slider
    const delay = parseInt(document.getElementById("delay-slider").value);

    // Get cube value from slider (2^(value+1))
    const cubeSliderValue = parseInt(document.getElementById("max-cube-slider").value);
    const maxCube = Math.pow(2, cubeSliderValue + 1);

    this.engine.updateSettings(
      p1Name,
      p2Name,
      minutes,
      delay,
      maxCube,
    );
    this.hideSettings();
    this.updateUI();
  }

  updateGameState(state) {
    this.currentState = state;
    this.gameStateBanner.setAttribute("data-state", state);
    const messages = {
      [STATE.READY]: "Ready to Start",
      [STATE.RUNNING]: "Game in Progress",
      [STATE.PAUSED]: "Game Paused",
      [STATE.DOUBLE]: "Double Offered",
      [STATE.ENDED]: "Game Over",
    };
    this.stateMessage.textContent = messages[state];
  }

  getPlayerElements(player) {
    return player === this.engine.getPlayerOne()
      ? this.player1El
      : this.player2El;
  }

  updateUI() {
    const activePlayer = this.engine.getActivePlayer();
    const isP1 = activePlayer === this.engine.getPlayerOne();

    this.player1El.querySelector(".player-name").textContent =
      this.engine.getPlayerOne().name;
    this.player2El.querySelector(".player-name").textContent =
      this.engine.getPlayerTwo().name;
    this.player1El.classList.toggle("active", isP1);
    this.player2El.classList.toggle("active", !isP1);

    const cubeVal = this.engine.getCubeValue().toString();
    const span = this.doubleButton.querySelector("span");
    if (span && span.textContent !== cubeVal) {
      this.doubleButton.style.transform = "scale(1.2)";
      setTimeout(() => {
        span.textContent = cubeVal;
        this.doubleButton.style.transform = "scale(1)";
      }, CONFIG.ANIMATION_SCALE_DURATION_MS);
    }

    const owner = this.engine.getCubeOwner();
    this.player1El.classList.toggle(
      "has-cube",
      owner === CubeOwnership.PlayerOne,
    );
    this.player2El.classList.toggle(
      "has-cube",
      owner === CubeOwnership.PlayerTwo,
    );

    this.player1El.querySelector(".player-score").textContent =
      this.engine.getPlayerOne().score;
    this.player2El.querySelector(".player-score").textContent =
      this.engine.getPlayerTwo().score;

    const cubeValue = this.engine.getCubeValue();
    const maxReached =
      cubeValue * 2 > this.engine.getDoublingCube().getMaxValue();
    const pOwnership = isP1 ? CubeOwnership.PlayerOne : CubeOwnership.PlayerTwo;
    const cantUse = !this.engine.getDoublingCube().canDouble(pOwnership);

    this.doubleButton.disabled =
      !this.engine.isGameRunning() || maxReached || cantUse;
    this.settingsButton.disabled = this.engine.isGameRunning();
    this.endMatchButton.disabled = this.currentState !== STATE.PAUSED;
    this.resetButton.disabled = ![
      STATE.READY,
      STATE.PAUSED,
      STATE.ENDED,
    ].includes(this.currentState);

    if (!this.engine.isGameRunning() && this.currentState !== STATE.READY)
      this.updateGameState(STATE.ENDED);
  }

  updateClocks() {
    if (this.engine.isGameRunning()) {
      const ap = this.engine.getActivePlayer();
      if (ap.clock.isTimeUp()) {
        const winner = this.engine.getOpponent(ap);
        this.engine.switchTurn();
        this.updateGameState(STATE.ENDED);
        this.resetButton.disabled = false;
        this.settingsButton.disabled = false;
        this.pauseButton.disabled = true;
        this.doubleButton.disabled = true;
        this.showTimeUpDialog(ap.name, winner.name);
      }
    }

    const fmt = (t) => {
      const s = Math.floor(t / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      const ms = t % 1000;
      if (m < 1)
        return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${ms.toString().slice(0, 2).padStart(2, "0")}`;
      return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const p1 = this.engine.getPlayerOne();
    const p2 = this.engine.getPlayerTwo();
    this.player1El.querySelector(".clock").textContent = fmt(
      p1.clock.getTimeLeftMs(),
    );
    this.player2El.querySelector(".clock").textContent = fmt(
      p2.clock.getTimeLeftMs(),
    );

    const updateBars = (pl, el) => {
      const dBar = el.querySelector(".delay-progress");
      const mBar = el.querySelector(".main-time-progress");
      const dCont = el.querySelector(".delay-container");
      const dTimeEl = el.querySelector(".delay-time");
      const isActive =
        this.engine.isGameRunning() &&
        !this.isPaused &&
        pl === this.engine.getActivePlayer();
      const dTotal = pl.clock.getDelayMs();
      const dLeft = pl.clock.getDelayTimeLeftMs();

      if (isActive && dLeft > 0 && dTotal > 0) {
        dCont.classList.add("active");
        dBar.style.width =
          dLeft === dTotal ? "100%" : `${(dLeft / dTotal) * 100}%`;
        dTimeEl.textContent = (dLeft / 1000).toFixed(1);
        dCont.classList.toggle(
          "low",
          dLeft < CONFIG.DELAY_LOW_THRESHOLD * dTotal,
        );
      } else {
        dCont.classList.remove("active", "low");
        dBar.style.width = "0%";
        dTimeEl.textContent = (dTotal / 1000).toFixed(1);
        mBar.style.width = `${(pl.clock.getTimeLeftMs() / pl.clock.getInitialTimeMs()) * 100}%`;
      }
    };

    updateBars(p1, this.player1El);
    updateBars(p2, this.player2El);
  }

  showDoubleDialog() {
    const cur = this.engine.getCubeValue();
    const ap = this.engine.getActivePlayer();
    this.doubleOfferOverlay.querySelector(".double-offer-message").textContent =
      `${ap.name}, do you accept the double?`;
    this.doubleOfferOverlay.querySelector(".current-value").textContent = cur;
    this.doubleOfferOverlay.querySelector(".new-value").textContent = cur * 2;
    this.doubleOfferOverlay.classList.add("active");
    this.updateGameState(STATE.DOUBLE);
    this.doubleButton.disabled = true;
    this.updateUI();

    const cleanup = () => {
      this.doubleOfferOverlay.classList.remove("active");
      this.takeButton.onclick = null;
      this.passButton.onclick = null;
    };

    this.takeButton.onclick = () => {
      this.engine.takeDouble();
      cleanup();
      this.updateGameState(STATE.RUNNING);
      this.updateUI();
      if ("vibrate" in navigator)
        navigator.vibrate(CONFIG.VIBRATE_DOUBLE_ACCEPT);
    };

    this.passButton.onclick = () => {
      const pts = this.engine.rejectDouble();
      cleanup();
      this.updateGameState(STATE.ENDED);
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
      this.doubleButton.disabled = true;
      const winner = this.engine.getPreviousPlayer();
      this.showGameResultDialog(`${winner.name} wins ${pts} points!`);
      if ("vibrate" in navigator)
        navigator.vibrate(CONFIG.VIBRATE_DOUBLE_REJECT);
      this.updateUI();
    };
  }

  showConfirmDialog(msg, onConfirm) {
    this.confirmDialogOverlay.querySelector(".confirm-message").textContent =
      msg;
    this.confirmDialogOverlay.classList.add("active");
    const confirmBtn =
      this.confirmDialogOverlay.querySelector(".confirm-button");
    const cancelBtn = this.confirmDialogOverlay.querySelector(".cancel-button");
    const cleanup = () => {
      this.confirmDialogOverlay.classList.remove("active");
      confirmBtn.onclick = null;
      cancelBtn.onclick = null;
    };
    confirmBtn.onclick = () => {
      cleanup();
      onConfirm();
    };
    cancelBtn.onclick = cleanup;
  }

  resetGame() {
    this.showConfirmDialog("Are you sure you want to reset the game?", () => {
      if (this.wakeLock) {
        this.wakeLock
          .release()
          .then(() => {
            this.wakeLock = null;
          })
          .catch(() => {});
      }
      this.engine.resetGame();
      this.isPaused = false;
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
      this.resetButton.disabled = true;
      this.updateGameState(STATE.READY);
      this.updateUI();
      if ("vibrate" in navigator) navigator.vibrate(CONFIG.VIBRATE_RESET);
    });
  }

  showEndMatchDialog() {
    const p1 = this.engine.getPlayerOne();
    const p2 = this.engine.getPlayerTwo();
    this.winnerButtons[0].textContent = p1.name;
    this.winnerButtons[1].textContent = p2.name;
    this.currentCubeValue.textContent = this.engine.getCubeValue();

    const getSel = (btns) => {
      const sel = Array.from(btns).find((b) =>
        b.classList.contains("selected"),
      );
      return sel ? sel.dataset.value : "";
    };

    const updPts = () => {
      const base = parseInt(getSel(this.pointsButtons));
      this.pointsCalculation.textContent = base * this.engine.getCubeValue();
    };

    this.winnerButtons.forEach((b) => {
      b.onclick = () => {
        this.winnerButtons.forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        updPts();
      };
    });

    this.pointsButtons.forEach((b) => {
      b.onclick = () => {
        this.pointsButtons.forEach((x) => x.classList.remove("selected"));
        b.classList.add("selected");
        updPts();
      };
    });

    this.endMatchOverlay.classList.add("active");

    const cleanup = () => {
      this.endMatchOverlay.classList.remove("active");
      this.confirmEndMatchButton.onclick = null;
      this.cancelEndMatchButton.onclick = null;
      this.winnerButtons.forEach((b) => (b.onclick = null));
      this.pointsButtons.forEach((b) => (b.onclick = null));
    };

    this.confirmEndMatchButton.onclick = () => {
      const winVal = getSel(this.winnerButtons);
      const winner = winVal === "player1" ? p1 : p2;
      const base = parseInt(getSel(this.pointsButtons));
      const total = base * this.engine.getCubeValue();
      winner.score += total;
      cleanup();
      this.updateGameState(STATE.ENDED);
      this.startButton.disabled = false;
      this.pauseButton.disabled = true;
      this.doubleButton.disabled = true;
      this.showGameResultDialog(`${winner.name} wins ${total} points!`);
      if ("vibrate" in navigator) navigator.vibrate(CONFIG.VIBRATE_END_MATCH);
      this.updateUI();
    };

    this.cancelEndMatchButton.onclick = cleanup;
    updPts();
  }

  toggleFullscreen() {
    const container = document.querySelector(".container");
    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => container.classList.add("fullscreen"))
        .catch(() => {});
    } else {
      document
        .exitFullscreen()
        .then(() => container.classList.remove("fullscreen"))
        .catch(() => {});
    }
  }

  showTimeUpDialog(pName, wName) {
    this.timeUpOverlay.querySelector(".time-up-message").textContent =
      `${pName} ran out of time! ${wName} wins!`;
    this.timeUpOverlay.classList.add("active");
  }

  showGameResultDialog(msg) {
    this.gameResultOverlay.querySelector(".game-result-message").textContent =
      msg;
    this.gameResultOverlay.classList.add("active");
  }
}

new GameUI();
