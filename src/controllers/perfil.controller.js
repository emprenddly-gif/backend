import pool from "../config/db.js";

// ==========================
//   OBTENER PERFIL
// ==========================
export const getPerfil = async (req, res) => {
  try {
    const { usuario } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM Usuarios WHERE Usuario = ?",
      [usuario]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Perfil no encontrado" });

    res.json(rows[0]);
  } catch (error) {
    console.error("Error en getPerfil:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// ==========================
//   ACTUALIZAR PERFIL
// ==========================
export const updatePerfil = async (req, res) => {
  try {
    const { usuario } = req.params;
    const { nombre, apellido, correo } = req.body;

    console.log("Datos recibidos:", { usuario, nombre, apellido, correo });

    const [result] = await pool.query(
      "UPDATE Usuarios SET Nombre=?, Apellido=?, Correo=? WHERE Usuario=?",
      [nombre, apellido, correo, usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    console.error("Error en updatePerfil:", error);
    res.status(500).json({ message: "Error al actualizar el perfil" });
  }
};

// ==========================
//   ELIMINAR PERFIL
// ==========================
export const deletePerfil = async (req, res) => {
  try {
    const { usuario } = req.params;

    const [result] = await pool.query(
      "DELETE FROM Usuarios WHERE Usuario=?",
      [usuario]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Cuenta eliminada correctamente" });
  } catch (error) {
    console.error("Error en deletePerfil:", error);
    res.status(500).json({ message: "Error al eliminar la cuenta" });
  }
};