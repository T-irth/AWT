const express = require('express')
const router = express.Router()
const AuthController = require("../controllers/authController")
const authController = require('../controllers/authController')
router.post('/',authController.registorUser)
module.exports = router