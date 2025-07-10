const bcrypt = require('bcrypt')

async function encryptPassword(password) {
    return await bcrypt.hash(password, 10)
}

async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword)
}

module.exports = {
    encryptPassword,
    comparePassword,
}