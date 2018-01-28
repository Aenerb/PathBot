require('babel-polyfill');
const Character = require('./Character');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

class CharacterReporter {
  constructor(characterName) {
    this.characterName = characterName;
    this.Character = new Character(this.characterName);
    this.characterData = this.Character.characterData();
  }

  reportAttributes() {
    const fullAttributes = {};
    fullAttributes.name = this.characterData.name;
    fullAttributes.race = this.characterData.race;
    fullAttributes.class = this.characterData.class;
    fullAttributes.level = this.characterData.level;
    fullAttributes.attributemodifiers = this.characterData.attributemodifiers;
    return fullAttributes;
  }

  reportAll() {
    const charSkills = this.characterData.skills;
    let skillList = '';
    logger.debug(`charSkills: ${charSkills}`);
    Object.keys(charSkills).forEach((key) => {
      switch (key) {
        case 'know':
          skillList += '**knowledge**: \n';
          Object.keys(charSkills.know).forEach((knowKey) => {
            if (charSkills.know[knowKey] !== 0) {
              logger.debug(`know: ${knowKey}`);
              logger.debug(`charSkills.know[knowKey]: ${charSkills.know[knowKey]}`);
              skillList += `\t*${knowKey}*:  ${charSkills.know[knowKey]}\n`;
            }
          });
          break;
        case 'craft':
          skillList += '**craft**: \n';
          Object.keys(charSkills.craft).forEach((craftKey) => {
            if (charSkills.craft[craftKey] !== 0) {
              logger.debug(`craft: ${craftKey}`);
              logger.debug(`charSkills.craft[craftKey]: ${charSkills.craft[craftKey]}`);
              skillList += `\t*${craftKey}*:  ${charSkills.craft[craftKey]}\n`;
            }
          });
          break;
        case 'profession':
          skillList += '**profession**: \n';
          Object.keys(charSkills.profession).forEach((professionKey) => {
            if (charSkills.profession[professionKey] !== 0) {
              logger.debug(`profession: ${professionKey}`);
              logger.debug(`charSkills.profession[professionKey]: ${charSkills.profession[professionKey]}`);
              skillList += `\t*${professionKey}*:  ${charSkills.profession[professionKey]}\n`;
            }
          });
          break;
        default:
          if (charSkills[key] !== 0) {
            logger.debug(`key: ${key}`);
            logger.debug(`charSkills[key]: ${charSkills[key]}`);
            skillList += `**${key}**:  ${charSkills[key]}\n`;
          }
          break;
      }
    });
    return skillList;
  }

  reportOne(actionData) {
    logger.debug(`actionData: ${actionData}`);
    const skillResult = {};
    const charSkills = this.characterData.skills;
    logger.debug(`I found these skills: ${JSON.stringify(charSkills)}`);

    const [mainskill, subskill] = actionData.toString().toLowerCase().split('.');
    const [skill, skillTwo] = actionData.toString().toLowerCase().split(',');
    skillResult.skillName = skill;
    let rollSkill = skill;
    if (subskill) {
      skillResult.modifier = charSkills[mainskill][subskill];
    } else {
      if (skillTwo) {
        rollSkill += ` ${skillTwo}`;
      }
      skillResult.modifier = charSkills[rollSkill];
    }
    logger.debug(`skillResult: ${JSON.stringify(skillResult)}`);
    return skillResult;
  }
}
module.exports = CharacterReporter;
