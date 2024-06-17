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
      10000 ||
      config.get<number>("duration", 25) *
        60 *
        1000;
    this.shortBreakDuration =
      5000 ||
      config.get<number>("shortBreak", 5) *
        60 *
        1000;
    this.longBreakDuration =
      8000 ||
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
      this.startTime = Date.now();
      this.isPaused = false;
      this.updateTimer();
      return;
    }

    if (this.timerInterval) {
      return;
    }

    this.remainingTime =
      this.getModeDuration(mode);
    this.label = this.getModeLabel(mode);
    this.startTime = Date.now();
    this.updateTimer();
  }

  public pause() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
      this.isPaused = true;
      this.updateRemainingTime();
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
      "Start pomodoing again!"
    );
  }

  private updateTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      this.updateRemainingTime();

      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = undefined;
        this.handleTimerEnd();
      }

      this.updateStatusBar();
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

  private getModeDuration(mode: StartMode) {
    switch (mode) {
      case "pomodoro":
        return this.pomodoroDuration;
      case "shortBreak":
        return this.shortBreakDuration;
      case "longBreak":
        return this.longBreakDuration;
      default:
        return this.pomodoroDuration;
    }
  }

  private getModeLabel(mode: StartMode) {
    switch (mode) {
      case "pomodoro":
        return this.workTimeLabel;
      case "shortBreak":
        return this.shortBreakTimeLabel;
      case "longBreak":
        return this.longBreakTimeLabel;
      default:
        return "Pomodoro";
    }
  }

  private updateStatusBar() {
    const minutes = Math.floor(
      this.remainingTime / 60000
    );
    const seconds = Math.floor(
      (this.remainingTime % 60000) / 1000
    );
    const timerString = `${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    vscode.window.setStatusBarMessage(
      `${this.label}: ${timerString}`
    );
  }
}
