const db = require("../config/db");

exports.getProductos = (req, res) => {
  const sql = "SELECT Id_Productos, Nombre FROM Productos";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al traer productos:", err);
      return res.status(500).json({ error: "Error al obtener productos" });
    }
    res.json(results);
  });
};
