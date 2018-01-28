const Dice = require('./dice.js');
const CharacterRoller = require('../src/Character/CharacterRoller.js');
const CharacterReporter = require('../src/Character/CharacterReporter.js');
const Discord = require('discord.js');
const logger = require('winston');
const config = require('../config.json');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.add(logger.transports.File, {
  filename: 'PathBot.log',
});
logger.level = 'debug';

// Initialize Discord Bot
const bot = new Discord.Client();

async function RollDice(payload) {
  let result = 0;
  let rollArray = [];
  logger.debug(`payload: ${payload}`);
  const [dieToRoll = '1d6', modifier = 0] = payload.split('+');
  if (!modifier) {
    result = 0;
  } else {
    result = parseInt(modifier, 10);
  }
  const [dieNum, dieType] = dieToRoll.split('d');
  const rolls = Dice.RollDice(dieNum, dieType);
  const rollResult = rolls.shift();
  rollArray = rolls;
  result += parseInt(rollResult, 10);
  rollArray.unshift(result);

  // Logger section.
  logger.debug(`rollResult is ${rollResult}`);
  logger.debug(`added rolls are ${result}`);
  logger.debug(`rollArray is: ${rollArray}`);
  logger.debug(`dieToRoll is ${dieToRoll}`);
  logger.debug(`modifier is ${modifier}`);

  return rollArray;
}

bot.on('ready', () => {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(`${bot.user.username} - ${bot.user.id}`);
});

bot.on('message', async (message) => {
  // Ignore any messages from any other bots.
  if (message.author.bot) return;

  // Ignore any message that doesn't start with !
  if (message.content.indexOf(config.prefix) !== 0) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const payload = args.join('');
  const charPayload = args;
  let result;
  let m;

  logger.info(`I got a call from ${message.author} to ${command} on ${message.channel}`);

  switch (command) {
    // !ping
    case 'ping':
      m = await message.channel.send('pong!');
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ping)}ms`);
      break;
    // !d20
    case 'd20':
      result = Dice.RollDice(1, 20);
      logger.debug(`result is: ${result}`);
      message.channel.send(`I rolled a ${result[0]}! [${result[1]}]`)
        .catch((err) => {
          logger.error(`d20 error: ${err}`);
        });
      break;
    // !d100
    case 'd100':
      result = Dice.RollDice(1, 100);
      message.channel.send(`I rolled a ${result[0]}! [${result[1]}]`)
        .then(msg => logger.info(`sent a reply to ${msg.author}`))
        .catch((err) => {
          logger.error(`d100 error: ${err}`);
        });
      break;
    // !roll
    case 'roll':
      if (payload) {
        logger.debug(`cmd is: ${command}`);
        logger.debug(`payload is: ${payload}`);
        const [rollTotal, ...rollRest] = await RollDice(payload);
        logger.debug(`result: ${rollTotal}`);
        message.channel.send(`I'm rolling for ${message.author} `)
          .then(message.channel.send(`I rolled a ${rollTotal}! [${rollRest}]`))
          .catch((err) => {
            logger.error(`roll error: ${err}`);
          });
      }
      break;
    case 'char':
      if (charPayload) {
        const [charName, charCmd, ...actionData] = charPayload;
        logger.debug(`Payload is: ${charPayload}`);
        switch (charCmd.toLowerCase()) {
          case 'roll':
            logger.debug('I\'ma rollin\' mah dice!');
            if (actionData) {
              try {
                const charRoller = new CharacterRoller(charName);
                const charSkills = charRoller.rollCharacter(actionData);
                const [rollTotal, ...rollRest] = await RollDice(charSkills.rollString);
                logger.debug(`result: ${rollTotal}`);
                message.channel.send(`I'm rolling a ${charSkills.skillName} check for ${message.author}`)
                  .then(message.channel.send(`I rolled a ${rollTotal}! [${rollRest}]+${charSkills.modifier}`))
                  .catch((err) => {
                    logger.error(`roll error: ${err}`);
                  });
              } catch (err) {
                message.channel.send(`I received an error: ${err}`)
                  .catch((error) => {
                    logger.error(`message error: ${error}`);
                  });
              }
            }
            break;
          case 'report':
            try {
              const charReporter = new CharacterReporter(charName);
              const charAttr = charReporter.reportAttributes();
              const skillList = charReporter.reportAll();
              logger.debug(`skillList: ${skillList}`);
              message.channel.send(`Character Details:\nName: ${charAttr.name}\nRace: ${charAttr.race}\nClass: ${charAttr.class}\nLevel: ${charAttr.level}\nAttribute Modifiers:\n\tStr: **${charAttr.attributemodifiers.str}** Dex: **${charAttr.attributemodifiers.dex}** Con: **${charAttr.attributemodifiers.con}** Int: **${charAttr.attributemodifiers.int}** Wis: **${charAttr.attributemodifiers.wis}** Cha: **${charAttr.attributemodifiers.cha}**`)
                .then(message.channel.send(`Character Skills and Modifiers:\n${skillList}`))
                .catch((err) => {
                  logger.error(`char report error: ${err}`);
                });
            } catch (err) {
              message.channel.send(`I received an error: ${err}`)
                .catch((error) => {
                  logger.error(`message error: ${error}`);
                });
            }
            break;
          default:
            message.channel.send(`I have found ${char.name}. They are a ${char.race} ${char.class}.`)
              .catch((err) => {
                logger.error(`char error: ${err}`);
              });
            break;
        }
      }
      break;
    case 'help':
      if (payload) {
        switch (payload) {
          case 'char':
            message.reply('Use to return specific information about a character, update a character\'s stats, or perform a skill check.\nExample: !char Sevren report\nExample: !char Sevren roll Diplomacy');
            break;
          case 'd20':
            message.reply('Roll a 1d20.');
            break;
          case 'd100':
            message.reply('Roll a 1d100.');
            break;
          case 'ping':
            message.reply('Get a pong from the robot as well as server latency.');
            break;
          case 'roll':
            message.reply('Roll some dice! The format is:\n!roll xdy+m\nwhere *x* is the number of die, *y* is the die type, and *m* is any modifiers.\nExample: !roll 1d20+14');
            break;
          default:
            message.reply(`I'm sorry, I don't have an entry for ${payload}`);
            break;
        }
      } else {
        message.reply('List of commands: !char, !d20, !d100, !ping, !roll. For more information about any of the commands please type !help <cmd>, e.g., !help d20.')
          .catch(err => logger.error(`help error: ${err}`));
      }
      break;
    default:
      message.reply('I\'m sorry, I can\'t do that Dave.');
      break;
  }
});

bot.login(config.token);

