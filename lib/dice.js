require('babel-polyfill');
const seedrandom = require('seedrandom');
const logger = require('winston');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
  colorize: true,
});
logger.level = 'debug';

const Dice = () => { };
module.exports = new Dice();

function rollMany(quantity, faces) {
  const rng = seedrandom('added entropy.', { entropy: true });
  const rollArray = [];
  let result = 0;
  for (let start = 0; start < quantity; start += 1) {
    const roll = Math.floor(rng() * faces) + 1;
    result += roll;
    rollArray.push(roll);
  }
  rollArray.unshift(result);
  return rollArray;
}

Dice.prototype.RollDice = (quant, face) => rollMany(quant, face);