import bcrypt from 'bcrypt'
const saltRounds = 10
export default function hashPassword(password) {
    const salt = bcrypt.genSaltSync(saltRounds)
    return bcrypt.hashSync(password, salt)
}