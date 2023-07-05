const schema = require('mongoose').Schema
const mongoose = require('mongoose')
const UserSchema = new schema({
        name: {
                type: String,
                required: true,
                unique: true
        },
        preferences: {
                type:Array,
                required: true,
        },
        password: {
                type: String,
                required: true
        }
})
const User = mongoose.model('User', UserSchema);
module.exports = {User};