const express = require("express");
const productController = require("../controller/product.controller");
const router = express.Router();

router.get("/", productController.fetchAll);
router.post("/", productController.create);
router.put("/:id", productController.update);
router.delete("/:id", productController.delete);
router.get("/:id", productController.findOne);
module.exports = router;
