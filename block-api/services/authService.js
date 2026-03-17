const user = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

class AuthenticationService{
    async register(name,email,password){
        const user = User.findOne({email})
        if(user) 
        {
            return 'User already exists'
        }
        user = new User({name,email,password})
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
    }
        }

module.exports = new AuthService()