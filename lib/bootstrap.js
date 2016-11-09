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
 * In the hop that yarn will be faster :D
 */
const isYarnAvailable = () => new Promise((resolve, reject) => {
  commandExists('yarn', (err, isAvailable) => {
    if (err) { reject(err); }
    resolve(isAvailable);
  });
});

/**
 * Query alternative npm registry for spectacle themes.
 * If we get back some themes (packages that have `spectacle-theme-`
 * in their name), we pass them back together with an option for no theme.
 * If no theme where found we only return the "default theme", which is none.
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

/**
 * Show a spinner with info about installation, while a promise is pending.
 * After the promise resolves/rejects the spinner will show a success/fail message.
 */
const createInstallSpinner = promise => {
  const spinner = ora(chalk.dim('Installing dependencies. This may take a while...')).start();
  return promise
    .then(() => {
      spinner.text = 'Installation complete!';
      spinner.succeed();
    })
    .catch(err => {
      // Forward, we only want to stop the spinner.
      spinner.text = 'Installation failed!';
      spinner.fail();
      return Promise.reject(err);
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


// Bootstrap & Preparetion
// ---------------
/**
 * Copy template files into project directory,
 * add `melodrama-scripts` to the `package.json` and
 * create/append a `.gitignore` (reason: https://github.com/npm/npm/issues/1862).
 */
const bootstrapDirectory = dir => {
  const melodramaPkgData = {
    scripts: {start: 'melodrama-scripts start index.js'},
    private: true,
    readme: 'README.md'
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
    .then(pkg => Object.assign({}, pkg, melodramaPkgData))
    .then(pkg => writePkg(dir, pkg));
  const createGitIgnore = () => new Promise((resolve, reject) => {
    const gitPath = path.join(dir, '.gitignore');
    const write = fs.existsSync(gitPath) ? fs.appendFile : fs.outputFile;
    write(gitPath, gitignoreData, err => {
      if(err) { reject(err); }
      resolve();
    });
  });

  // Execute sequentially, b/c sometimes the scripts are "too" parallel
  // and that causes some i/o errors ¯\_(ツ)_/¯
  return copyTemplateFiles().then(updatePackage).then(createGitIgnore);
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
 * React(Dom) and Spectacle are always needed. But if the
 * user doesn't want any syntax highlighting we can omit PrismJS.
 * If the user chose a theme, we add it as a dependency here, too.
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
      // Use `execa`, b/c it lets us handle errors more gracefully.
      const child = spawn(cmd, args.concat(dependencies));
      // Only show a spinner if stdout isn't verbose.
      if (verbose) {
        child.stdout.pipe(process.stdout);
        return child;
      }
      return createInstallSpinner(child);
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