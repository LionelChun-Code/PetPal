const bcrypt = require('bcrypt');
const saltRounds = 12;


function hashPassword(password) {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
}


function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}


module.exports = {
  hashPassword,
  comparePassword
};
