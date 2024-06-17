import * as vscode from "vscode";
import { PomodoroTimer } from "./commands";

export function activate(
  context: vscode.ExtensionContext
) {
  const pomodoroTimer = new PomodoroTimer(
    context
  );

  const startCommand =
    vscode.commands.registerCommand(
      "pomodoro.startTimer",
      () => {
        pomodoroTimer.start();
      }
    );

  const pauseCommand =
    vscode.commands.registerCommand(
      "pomodoro.pauseTimer",
      () => {
        pomodoroTimer.pause();
      }
    );

  const resetCommand =
    vscode.commands.registerCommand(
      "pomodoro.resetTimer",
      () => {
        pomodoroTimer.reset();
      }
    );

  context.subscriptions.push(startCommand);
  context.subscriptions.push(pauseCommand);
  context.subscriptions.push(resetCommand);

  vscode.commands.executeCommand(
    "setContext",
    "isPomodoroRunning",
    false
  );
}

export function deactivate() {}
