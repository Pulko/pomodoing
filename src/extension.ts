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
        vscode.commands.executeCommand(
          "setContext",
          "isPomodoroRunning",
          true
        );
      }
    );

  const pauseCommand =
    vscode.commands.registerCommand(
      "pomodoro.pauseTimer",
      () => {
        pomodoroTimer.pause();
        vscode.commands.executeCommand(
          "setContext",
          "isPomodoroRunning",
          false
        );
      }
    );

  const resetCommand =
    vscode.commands.registerCommand(
      "pomodoro.resetTimer",
      () => {
        pomodoroTimer.reset();
        vscode.commands.executeCommand(
          "setContext",
          "isPomodoroRunning",
          true
        );
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

// Once we have icons, we can add them to commands and show in editor/title
// "editor/title": [
//   {
//     "command": "pomodoro.pauseTimer",
//     "alt": "pomodoro.pauseTimer",
//     "when": "isPomodoroRunning",
//     "group": "navigation"
//   },
//   {
//     "command": "pomodoro.startTimer",
//     "alt": "pomodoro.startTimer",
//     "when": "!isPomodoroRunning",
//     "group": "navigation"
//   }
// ]

export function deactivate() {}
