const authService = require("../services/authService");

class AuthController {
    async register(req, res) {
        let ret = await authService.register(req.req);
        if(typeof ret === 'string') {
            res.json({status: 'error', message: 'problem in registration process'})
        } else {
            res.json({status: 'success', message: 'user registered successfully'})
        }
    }
}
