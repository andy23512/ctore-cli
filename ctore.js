#!/usr/bin/env node

const child_process = require('child_process');
const commandExists = require('command-exists');
const inquirer = require('inquirer');
const questions = [
  {type: 'confirm', name: 'routing', message: 'Generate a routing module?', default: true},
  {type: 'list', name: 'style', message: 'Choose a file extension for style files', default: 1, choices: [
    {name: 'CSS', value: null},
    {name: 'SASS', value: 'sass'},
    {name: 'Stylus', value: 'stylus'},
  ]}
];
let projectName = '';
const args = [];

getProjectName()
  .then(() => commandExists('ng'))
  .then(getConfig)
  .then(runNgCli)
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
      if(answers.routing) args.push('--routing');
      if(answers.style) args.push(`--style=${answers.style}`);
    })
}

function runNgCli() {
  return promiseSpawn('ng', ['new', projectName, ...args]).catch(code => {
    throw new Error('ng-cli process exited with error code ' + code);
  })
}

function promiseSpawn(command, args) {
  return new Promise((resolve, reject) => {
    child_process
      .spawn(command, args, { shell: true, stdio: 'inherit' })
      .on('close', code => (code === 0 ? resolve() : reject()));
  });
}
