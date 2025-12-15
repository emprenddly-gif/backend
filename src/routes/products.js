// products.js
import express from "express";
const router = express.Router();

// tus rutas
router.get("/", (req, res) => {
  res.send("Productos");
});

// Exportar por default
export default router;
