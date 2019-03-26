#!/usr/bin/env node

const child_process = require('child_process');
const commandExists = require('command-exists');
const inquirer = require('inquirer');
const questions = [
  {
    type: 'checkbox', name: 'schematics', message: 'Which schematics do you want to add?', choices: [
      {name: 'Angular Material', value: '@angular/material'},
      {name: 'Jest', value: '@briebug/jest-schematic'},
    ]
  }
];
let projectName = '';
let userOptions = null;

getProjectName()
  .then(() => commandExists('ng'))
  .then(getConfig)
  .then(runNgCli)
  .then(changeDirToProject)
  .then(addSchematics)
  .catch(console.error);

function getProjectName() {
  return new Promise((resolve, reject) => {
    projectName = process.argv[2];
    projectName
      ? resolve()
      : reject(
          new Error(
            'Error: No project name is given\nUsage: ctore <project-name>'
          )
        );
  });
}

function getConfig() {
  process.stdout.write('\033c\033[3J'); // clear screen
  return inquirer
    .prompt(questions)
    .then(answers => {
      userOptions = answers;
    })
}

function runNgCli() {
  return promiseSpawn('ng', ['new', projectName]).catch(code => {
    throw new Error('ng-cli process exited with error code ' + code);
  })
}

function changeDirToProject() {
  return Promise.resolve(process.chdir(projectName));
}

function addSchematics() {
  return userOptions.schematics
    .reduce(
      (p, schematic) => p.then(_ => promiseSpawn('ng', ['add', schematic])),
      Promise.resolve()
    )
}

function promiseSpawn(command, args) {
  return new Promise((resolve, reject) => {
    child_process
      .spawn(command, args, { shell: true, stdio: 'inherit' })
      .on('close', code => (code === 0 ? resolve() : reject()));
  });
}
