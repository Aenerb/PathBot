require('babel-polyfill');
const Character = require('./Character');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

class CharacterRoller {
  constructor(characterName) {
    this.characterName = characterName;
    this.Character = new Character(this.characterName);
    this.characterData = this.Character.characterData();
  }

  rollCharacter(actionData) {
    const skillResult = {};
    const charSkills = this.characterData.skills;

    const [skillString, skillMod] = actionData.toString().toLowerCase().split('+');
    const [mainskill, subskill] = skillString.split('.');
    const [skill, skillTwo] = skillString.split(',');
    let rollSkill = skill;
    if (skillTwo) {
      rollSkill += ` ${skillTwo}`;
    }
    skillResult.skillName = rollSkill;

    if (subskill) {
      skillResult.modifier = charSkills[mainskill][subskill];
    } else {
      skillResult.modifier = charSkills[rollSkill];
    }

    if (skillResult.modifier === undefined) {
      throw new Error(`skill [${skillResult.skillName}] not found!`);
    } else {
      if (skillMod) {
        skillResult.modifier = (+skillResult.modifier) + (+skillMod);
      }
      skillResult.rollString = `1d20+${skillResult.modifier}`;
    }
    return skillResult;
  }
}

module.exports = CharacterRoller;
