import * as vscode from "vscode";

type StartMode =
  | "pomodoro"
  | "shortBreak"
  | "longBreak";

export class PomodoroTimer {
  private timerInterval:
    | NodeJS.Timeout
    | undefined;
  private remainingTime: number;
  private context: vscode.ExtensionContext;
  private pomodoroDuration: number;
  private shortBreakDuration: number;
  private longBreakDuration: number;
  private longBreakAfter: number;
  private breakNotification: boolean;
  private breakNotificationText: string;
  private longBreakNotificationText: string;
  private pomodoroCount: number = 0;
  private label: string;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private workTimeLabel: string;
  private shortBreakTimeLabel: string;
  private longBreakTimeLabel: string;
  private icon: string = "$(flame)";

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    const config =
      vscode.workspace.getConfiguration(
        "pomodoing"
      );

    this.workTimeLabel = config.get<string>(
      "workTimeLabel",
      "Work time"
    );
    this.shortBreakTimeLabel = config.get<string>(
      "shortBreakTimeLabel",
      "Short break"
    );
    this.longBreakTimeLabel = config.get<string>(
      "longBreakTimeLabel",
      "Long break"
    );
    this.pomodoroDuration =
      config.get<number>("duration", 25) *
      60 *
      1000;
    this.shortBreakDuration =
      config.get<number>("shortBreak", 5) *
      60 *
      1000;
    this.longBreakDuration =
      config.get<number>("longBreak", 15) *
      60 *
      1000;
    this.longBreakAfter = config.get<number>(
      "longBreakAfter",
      4
    );
    this.breakNotification = config.get<boolean>(
      "breakNotification",
      true
    );
    this.breakNotificationText =
      config.get<string>(
        "breakNotificationText",
        "Short break!"
      );
    this.longBreakNotificationText =
      config.get<string>(
        "longBreakNotificationText",
        "Long break!"
      );

    this.remainingTime = this.pomodoroDuration;
    this.label = this.workTimeLabel;
    this.updateStatusBar();
  }

  public start(mode: StartMode = "pomodoro") {
    if (this.isPaused) {
      this.isPaused = false;
    } else {
      const config = this.getModeConfig(mode);
      this.remainingTime = config.duration;
      this.label = config.label;
      this.icon = config.icon;
    }

    this.startTime = Date.now();
    this.updateTimer(true);
  }

  public pause() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
      this.isPaused = true;
      this.updateRemainingTime();
      this.updateStatusBar();
      vscode.window.showInformationMessage(
        "Pomodoro timer paused."
      );
    }
  }

  public reset() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }

    this.pomodoroCount = 0;
    this.isPaused = false;
    this.remainingTime = this.pomodoroDuration;
    this.label = this.workTimeLabel;
    this.updateStatusBar();
    vscode.window.showInformationMessage(
      "Pomodoro timer reset."
    );
  }

  private updateTimer(
    immediate: boolean = false
  ) {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    if (immediate) {
      this.updateStatusBar();
    }

    this.timerInterval = setInterval(() => {
      this.updateRemainingTime();

      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = undefined;
        this.handleTimerEnd();
      } else {
        this.updateStatusBar();
      }
    }, 1000);
  }

  private updateRemainingTime() {
    const now = Date.now();
    this.remainingTime -= now - this.startTime;
    this.startTime = now;
  }

  private handleTimerEnd() {
    if (this.label === this.workTimeLabel) {
      this.pomodoroCount++;
      if (
        this.pomodoroCount >= this.longBreakAfter
      ) {
        if (this.breakNotification) {
          vscode.window.showInformationMessage(
            this.longBreakNotificationText
          );
        }
        this.start("longBreak");
        this.pomodoroCount = 0;
      } else {
        if (this.breakNotification) {
          vscode.window.showInformationMessage(
            this.breakNotificationText
          );
        }
        this.start("shortBreak");
      }
    } else {
      this.start("pomodoro");
    }
  }

  private getModeConfig(mode: StartMode) {
    switch (mode) {
      case "pomodoro":
        return {
          label: this.workTimeLabel,
          duration: this.pomodoroDuration,
          icon: "$(flame)",
        };
      case "shortBreak":
        return {
          label: this.shortBreakTimeLabel,
          duration: this.shortBreakDuration,
          icon: "$(check)",
        };
      case "longBreak":
        return {
          label: this.longBreakTimeLabel,
          duration: this.longBreakDuration,
          icon: "$(check-all)",
        };
    }
  }

  private updateStatusBar() {
    const minutes = Math.floor(
      this.remainingTime / 60000
    );
    const seconds = Math.ceil(
      (this.remainingTime % 60000) / 1000
    );
    const timerString = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    vscode.window.setStatusBarMessage(
      `${
        this.isPaused
          ? "$(debug-pause)"
          : this.icon
      } ${this.label}: ${timerString}`
    );
  }
}
