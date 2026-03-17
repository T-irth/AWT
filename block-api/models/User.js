const e = require('express')
const mongoose = require('mongoose')
const users=mongoose.Schema({
name:{type: String, required: true},
password:{type: String, required: true},
email:{type: String, required: true, unique: true},
},{timestamps: true})

module.exports=mongoose.model('User',users)