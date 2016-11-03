const path = require('path');
const chalk = require('chalk');
const commandExists = require('command-exists');
const spawn = require('execa');
const fs = require('fs-extra');
const got = require('got');
const inquirer = require('inquirer');
const ora = require('ora');
const readPkg = require('read-pkg');
const writePkg = require('write-pkg');

// Helpers
// ---------------
/**
 * Check wheter we can use `yarn` instead of `npm`.
 */
const isYarnAvailable = () => new Promise((resolve, reject) => {
  commandExists('yarn', (err, isAvailable) => {
    if (err) { reject(err); }
    resolve(isAvailable);
  });
});

/**
 * Query alternative npm registry for spectacle themes.
 */
const defaultTheme = 'none';
const themePrefix = 'spectacle-theme-';
const fetchSpectacleThemes = () => {
  const spinner = ora(chalk.dim('Fetching Spectacle themes...')).start();
  return got(`https://api.npms.io/v2/search?q=${themePrefix}`, {json: true})
    .then(({ body }) => {
      const themes = body.results
        .map(result => result.package)
        .map(({ name }) => name.replace(themePrefix, ''));
      themes.unshift(defaultTheme);
      spinner.text = 'Spectacle themes fetched.';
      spinner.succeed();
      return themes;
    })
    .catch(() => {
      spinner.text = chalk.red('There was a problem fetching theme suggestions. Using default theme...');
      spinner.fail();
      return [defaultTheme];
    });
};


// Questions
// ---------------
const askForTheme = themes => ({
  type: 'list',
  name: 'theme',
  message: 'Choose a theme:',
  choices: themes
});

const askForSyntaxHighliting = () => ({
  type: 'confirm',
  name: 'syntax',
  message: 'Do you want syntax highlighting?',
  default: true
});


// Bootstrapping
// ---------------
/**
 * Copies template files into project directory,
 * add `melodrama-scripts` to the `package.json` and
 * create a `.gitignore` (reason: https://github.com/npm/npm/issues/1862).
 */
const bootstrapDirectory = dir => {
  const melodramaPktData = {
    scripts: {start: 'melodrama-scripts start index.js'},
    readme: 'README.md',
  };
  const gitignoreData =`
.DS_Store
node_modules
npm-debug.log`;

  const copyTemplateFiles = () => new Promise((resolve, reject) => {
    fs.copy(path.join(__dirname, 'template'), dir, err => {
      if (err) { reject(err); }
      resolve();
    });
  });
  const updatePackage = () => readPkg(dir)
    .catch(() => ({ name: path.basename(dir), version: '1.0.0' })) // Whoops, no package!?
    .then(pkg => Object.assign({}, pkg, melodramaPktData))
    .then(pkg => writePkg(dir, pkg));
  const createGitIgnore = () => new Promise((resolve, reject) => {
    const gitPath = path.join(dir, '.gitignore');
    const write = fs.existsSync(gitPath) ? fs.appendFile : fs.outputFile;
    write(gitPath, gitignoreData, err => {
      if(err) { reject(err); }
      resolve();
    });
  });

  return Promise.all([copyTemplateFiles(), updatePackage(), createGitIgnore()]);
};

/**
 * Prepate install command depending on the availble package manager.
 */
const prepareInstallCommand = verbose => {
  return isYarnAvailable().then(isAvailable => {
    let cmd, args;
    if (isAvailable) {
      cmd = 'yarn';
      args = ['add', '--exact'];
    } else {
      cmd = 'npm';
      args = ['install', '--SE'];
      if (verbose) { args.push('--verbose'); }
    }
    return { cmd, args };
  });
};

/**
 * Prepare a list of required and optional dependencies.
 */
const prepareDependencies = ({ syntax, theme }) => {
  const dependencies = ['react', 'react-dom', 'spectacle'];
  if (syntax) { dependencies.push('prismjs'); }
  if (theme && theme !== defaultTheme) { dependencies.push(`${themePrefix}${theme}`); }
  return dependencies;
};


// Run
// ---------------
/**
 * Prompt the user with some questions about the presentation
 * and create the boilerplate accordingly.
 */
const run = (dir, { verbose }) => {
  return fetchSpectacleThemes()
    .then(themes => {
      let questions = [askForSyntaxHighliting()];
      // If we found some additional themes, let the user chose one.
      if (themes.length > 1) {
        questions.unshift(askForTheme(themes));
      }
      return inquirer.prompt(questions);
    })
    .then((config) => Promise.all([
      prepareInstallCommand(verbose),
      prepareDependencies(config),
      bootstrapDirectory(dir)
    ]))
    .then(([{cmd, args}, dependencies]) => {
      process.chdir(dir);

      const spinner = ora(chalk.dim('Installing dependencies. This may take a while...')).start();
      const child = spawn(cmd, args.concat(dependencies));
      if(verbose) {
        child.stdout.pipe(process.stdout);
      }
      return Promise.all([spinner, child]);
    })
    .then(([spinner]) => {
      spinner.text = 'Installation complete!';
      spinner.succeed();
    })
    .catch(([spinner, error]) => {
      spinner.text = 'Installation failed!';
      spinner.fail();
      // Just forward, we only want to stop the spinner.
      return Promise.reject(error);
    });
};


// Public API
// ---------------
module.exports = {
  run,
  bootstrapDirectory,
  prepareInstallCommand,
  prepareDependencies
};