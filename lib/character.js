require('babel-polyfill');
const characters = require('../resources/characters.json');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

const Character = () => { };
module.exports = new Character();

function getCharacter(reportName) {
  let thisChar;
  characters.forEach((character) => {
    if (character.name === reportName) {
      logger.debug(`character.name: ${character.name}`);
      thisChar = character;
    }
  });
  logger.debug(`This Character: ${JSON.stringify(thisChar)}`);
  return thisChar;
}

Character.prototype.Report = reportName => getCharacter(reportName);

