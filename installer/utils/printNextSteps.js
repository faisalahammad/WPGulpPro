const logSymbols = require('log-symbols');
const {green, yellow, cyan, dim} = require('chalk');

module.exports = () => {
	console.log(logSymbols.success, green('ALL DONE! WPGulpPro is ready to use.'));
	console.log(dim('WPGulpPro files have been downloaded to the current directory.'));
	console.log(dim('Inside this directory, you can run the following commands'));

	// Scripts.
	console.log();
	console.log(logSymbols.info, green('npm start'));
	console.log(dim('Use during development'));
	console.log(dim('It watches for any changes in your files'));

	console.log();
	console.log(logSymbols.info, 'For more commands, read the docs at:');
	console.log(green('https://github.com/faisalahammad/WPGulpPro'));

	// Get started.
	console.log();
	console.log(logSymbols.info, green('Get Started'));
	console.log(dim('I suggest that you begin by:'));
	console.log(`1. Editing the ${cyan('wpgulp.config.js')} file`);
	console.log(`2. And then running ${green('npm start')}`);
	console.log();
	console.log(dim('Follow the maintainer:'), green('https://twitter.com/faisalahammadwp'));
	console.log();
};
