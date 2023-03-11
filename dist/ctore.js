#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __importDefault(require("child_process"));
var command_exists_1 = __importDefault(require("command-exists"));
var inquirer_1 = __importDefault(require("inquirer"));
var projectName = "";
var userOptions;
getProjectName()
    .then(function () { return command_exists_1.default("ng"); })
    .then(function () { return command_exists_1.default("create-nx-workspace"); })
    .then(getConfig)
    .then(runCli)
    .then(changeDirToProject)
    .then(addSchematics)
    // tslint:disable-next-line: no-console
    .catch(console.error);
function getProjectName() {
    return new Promise(function (resolve, reject) {
        projectName = process.argv[2];
        projectName
            ? resolve()
            : reject(new Error("Error: No project name is given\nUsage: ctore <project-name>"));
    });
}
function getConfig() {
    // tslint:disable-next-line: no-console
    console.clear();
    return inquirer_1.default
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
            ],
        },
    ])
        .then(function (answers) {
        userOptions = answers;
    });
}
function runCli() {
    return promiseSpawn("create-nx-workspace", [
        projectName,
        "--preset=angular",
        "--appName=app",
        "--style=scss",
        "--nxCloud=false",
        "--skipGit",
    ]).catch(function (code) {
        throw new Error("create-nx-workspace exited with error code " + code);
    });
}
function changeDirToProject() {
    return Promise.resolve(process.chdir(projectName));
}
function addSchematics() {
    return userOptions.schematics.reduce(function (p, schematic) {
        return p
            .then(function (_) { return promiseSpawn("npm", ["i", schematic]); })
            .then(function () { return promiseSpawn("nx", ["g", schematic + ":ng-add"]); });
    }, Promise.resolve());
}
function promiseSpawn(command, args) {
    return new Promise(function (resolve, reject) {
        child_process_1.default
            .spawn(command, args, { shell: true, stdio: "inherit" })
            .on("close", function (code) { return (code === 0 ? resolve() : reject()); });
    });
}
