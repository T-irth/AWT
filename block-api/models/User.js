const mongoose = require('mongoose');
const users = mongoose.Schema({
    name: {type: String,require: true},
    password:{type:String, require:true},
    email: {type: String,require:true,unique:true},
},{timestamps: true})

module.exports = mongoose.model('Users',users)