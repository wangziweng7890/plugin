#!/usr/bin/env node

const chalk = require("chalk");
const commander = require("commander");
const pkg = require("../package.json");
const createDocs = require("./create");
const { program } = commander;

program
  .version(pkg.version, "-v --version")
  .description("create vue-docs for your proj")
  .action(() => {
    console.log(chalk.green("Welcome !"));
  });

program.command("gen:docs").description("gendocs for your project").action(createDocs);

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
