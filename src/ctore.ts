#!/usr/bin/env node
import childProcess from "child_process";
import commandExists from "command-exists";
import inquirer from "inquirer";

let projectName = "";
let userOptions: {
  schematics: any;
};

getProjectName()
  .then(() => commandExists("ng"))
  .then(() => commandExists("create-nx-workspace"))
  .then(getConfig)
  .then(runCli)
  .then(changeDirToProject)
  .then(addSchematics)
  // tslint:disable-next-line: no-console
  .catch(console.error);

function getProjectName() {
  return new Promise((resolve, reject) => {
    projectName = process.argv[2];
    projectName
      ? resolve()
      : reject(
          new Error(
            "Error: No project name is given\nUsage: ctore <project-name>"
          )
        );
  });
}

function getConfig() {
  // tslint:disable-next-line: no-console
  console.clear();
  return inquirer
    .prompt([
      {
        type: "checkbox",
        name: "schematics",
        message: "Which schematics do you want to add?",
        choices: [
          {
            name: "Angular Material (@angular/material)",
            value: "@angular/material",
            short: "Angular Material",
          },
          // {name: 'Jest (@briebug/jest-schematic)', value: '@briebug/jest-schematic', short: 'Jest'},
          {
            name: "NGXS (@ngxs/schematics)",
            value: "@ngxs/schematics",
            short: "NGXS",
          },
          /*{
            name: 'Apollo Angular (apollo-angular)',
            value: 'apollo-angular',
            short: 'Apollo Angular'
          }*/
        ],
      },
    ])
    .then((answers) => {
      userOptions = answers;
    });
}

function runCli() {
  return promiseSpawn("create-nx-workspace", [
    projectName,
    "--preset=angular",
    "--appName=app",
    "--style=scss",
  ]).catch((code) => {
    throw new Error("create-nx-workspace exited with error code " + code);
  });
}

function changeDirToProject() {
  return Promise.resolve(process.chdir(projectName));
}

function addSchematics() {
  return userOptions.schematics.reduce(
    (p: Promise<any>, schematic: string) =>
      p.then((_) => promiseSpawn("ng", ["add", schematic])),
    Promise.resolve()
  );
}

function promiseSpawn(command: string, args: string[]) {
  return new Promise((resolve, reject) => {
    childProcess
      .spawn(command, args, { shell: true, stdio: "inherit" })
      .on("close", (code) => (code === 0 ? resolve() : reject()));
  });
}
