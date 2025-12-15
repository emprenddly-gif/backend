const express = require("express");
const router = express.Router();
const { getProductos } = require("../controllers/product.controller");

router.get("/", getProductos);

module.exports = router;
