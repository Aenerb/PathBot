require('babel-polyfill');
const characters = require('../../resources/characters.json');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

/**
 * This is the base Character that other classes will create.
 * Constructor loads the character from the characters.json file.
 */
class Character {
  constructor(characterName) {
    this.characterName = characterName;
    this.characterData = () => {
      const myChar = characters.find((character) => {
        logger.debug(`character.name: ${character.name}`);
        logger.debug(`This Character: ${JSON.stringify(character)}`);
        return character.name === this.characterName;
      });
      if (myChar === undefined) {
        throw new Error(`${this.characterName} not found.`);
      }
      return myChar;
    };
  }
}

module.exports = Character;
