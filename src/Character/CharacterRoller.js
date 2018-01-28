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
    logger.debug(`actionData: ${actionData}`);
    const skillResult = {};
    const charSkills = this.characterData.skills;
    logger.debug(`I found these skills: ${JSON.stringify(charSkills)}`);

    const [mainskill, subskill] = actionData.toString().toLowerCase().split('.');
    const [skill, skillTwo] = actionData.toString().toLowerCase().split(',');
    logger.debug(`skill: ${skill}`);
    skillResult.skillName = skill;
    let rollSkill = skill;
    if (subskill) {
      logger.debug(`mainskill: ${mainskill}, subskill: ${subskill}`);
      skillResult.modifier = charSkills[mainskill][subskill];
      skillResult.rollString = `1d20+${skillResult.modifier}`;
    } else {
      if (skillTwo) {
        rollSkill += ` ${skillTwo}`;
      }
      logger.debug(`actionData: ${actionData}`);
      logger.debug(`roll: ${rollSkill}`);
      skillResult.modifier = charSkills[rollSkill];
      skillResult.rollString = `1d20+${skillResult.modifier}`;
      logger.debug(`rollString: ${skillResult.rollString}`);
    }
    logger.debug(`skillResult: ${JSON.stringify(skillResult)}`);
    return skillResult;
  }
}

module.exports = CharacterRoller;
