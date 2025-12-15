// routes/reportegastos.js
import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// 📊 Endpoint: gastos agrupados por categoría, con filtros opcionales (fecha y tipo)
router.get("/categorias", async (req, res) => {
  try {
    const { fecha, tipo } = req.query; // Ej: ?fecha=2025-11-09&tipo=Producción

    let query = `
      SELECT 
        rg.Categoria AS categoria, 
        SUM(rg.Monto) AS total
      FROM Registro_Gastos rg
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += " AND DATE(rg.Fecha) = ?";
      params.push(fecha);
    }

    if (tipo) {
      query += " AND LOWER(rg.Categoria) = LOWER(?)";
      params.push(tipo);
    }

    query += " GROUP BY rg.Categoria ORDER BY total DESC;";

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error en GET /reportegastos/categorias:", error);
    res.status(500).json({ error: "Error al obtener reporte de gastos" });
  }
});

// 📌 Endpoint: Total de gastos por día
router.get("/totalporfecha/:fecha", async (req, res) => {
  try {
    const { fecha } = req.params;

    const query = `
      SELECT COALESCE(SUM(Monto), 0) AS totalGastos
      FROM Registro_Gastos
      WHERE DATE(Fecha) = ?
    `;

    const [rows] = await pool.query(query, [fecha]);
    res.json(rows[0]);
  } catch (error) {
    console.error("❌ Error al obtener total de gastos:", error);
    res.status(500).json({ error: "Error obteniendo gastos" });
  }
});


export default router;
