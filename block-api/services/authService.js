const User = require("../models/User");
const bcrypt = require('bcryptjs');

class AuthenticationService {
    async registorUser(name, email, password) {

        let user = await User.findOne({ email });

        if (user) {
            return 'User already exists!';
        }

        user = new User({ name, email, password });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        return user;
    }
}

module.exports = new AuthenticationService();