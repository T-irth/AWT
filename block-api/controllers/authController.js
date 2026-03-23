const authService = require('../services/authService')
class AuthController{
    async registorUser(req,res){
       let ret = await authService.registorUser(
    req.body.name,
    req.body.email,
    req.body.password
);
       if(typeof ret === "string"){
        res.json({
            status: "Error",
            message: 'problem in registration process'
        })
       }else{
        res.json({
            status: "Sucess",

        })
       }

    }
}
module.exports = new AuthController();