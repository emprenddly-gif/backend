const express = require("express");
const router = express.Router();

const {
  getProductos,
  createSale,
  getVentas, 
  updateVenta
} = require("../controllers/sale.controller");

const upload = require("../middlewares/upload");
router.get("/productos", getProductos);
router.post("/", upload.single("imagen"), createSale);
router.get("/", getVentas); 
router.put("/sales/:id", updateVenta);

module.exports = router;
