import * as vscode from "vscode";
import { PomodoroTimer } from "./commands";

export function activate(
  context: vscode.ExtensionContext
) {
  const pomodoingTimer = new PomodoroTimer(
    context
  );

  const startCommand =
    vscode.commands.registerCommand(
      "pomodoing.startTimer",
      () => {
        pomodoingTimer.start();
        vscode.commands.executeCommand(
          "setContext",
          "isPomodoroRunning",
          true
        );
      }
    );

  const pauseCommand =
    vscode.commands.registerCommand(
      "pomodoing.pauseTimer",
      () => {
        pomodoingTimer.pause();
        vscode.commands.executeCommand(
          "setContext",
          "isPomodoroRunning",
          false
        );
      }
    );

  const resetCommand =
    vscode.commands.registerCommand(
      "pomodoing.resetTimer",
      () => {
        pomodoingTimer.reset();
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
//     "command": "pomodoing.pauseTimer",
//     "alt": "pomodoing.pauseTimer",
//     "when": "isPomodoroRunning",
//     "group": "navigation"
//   },
//   {
//     "command": "pomodoing.startTimer",
//     "alt": "pomodoing.startTimer",
//     "when": "!isPomodoroRunning",
//     "group": "navigation"
//   }
// ]

export function deactivate() {}
