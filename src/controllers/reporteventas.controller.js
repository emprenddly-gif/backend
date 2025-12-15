import pool from "../config/db.js";

/* ============================================================
   GET: obtener todos los reportes
============================================================ */
export const getReportes = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.Id_Reporte,
        r.Fecha_Reporte,
        u.Nombre AS Usuario,
        p.Nombre AS Producto,
        mp.Nombre AS Metodo_Pago,
        rv.Cantidad,
        rv.Fecha AS Fecha_Venta
      FROM Reporte_ventas r
      JOIN Usuarios u ON r.Id_Usuario = u.Id_Usuario
      JOIN Productos p ON r.Id_Productos = p.Id_Productos
      JOIN Registro_Ventas rv ON r.Id_Venta = rv.Id_Venta
      JOIN Metodo_Pago mp ON r.Id_Metodo = mp.Id_Metodo
      ORDER BY r.Id_Reporte DESC;
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo reportes" });
  }
};

/* ============================================================
   GET: obtener un reporte por ID
============================================================ */
export const getReporteById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        r.Id_Reporte,
        r.Fecha_Reporte,
        u.Nombre AS Usuario,
        p.Nombre AS Producto,
        mp.Nombre AS Metodo_Pago,
        rv.Cantidad,
        rv.Fecha AS Fecha_Venta
      FROM Reporte_ventas r
      JOIN Usuarios u ON r.Id_Usuario = u.Id_Usuario
      JOIN Productos p ON r.Id_Productos = p.Id_Productos
      JOIN Registro_Ventas rv ON r.Id_Venta = rv.Id_Venta
      JOIN Metodo_Pago mp ON r.Id_Metodo = mp.Id_Metodo
      WHERE r.Id_Reporte = ?
    `, [id]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Reporte no encontrado" });

    res.json(rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error obteniendo el reporte" });
  }
};