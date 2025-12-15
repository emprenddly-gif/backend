// Importaciones ESM
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";

import inventarioRoutes from "./routes/inventario.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import reportegastosRoutes from "./routes/reportegastos.routes.js";
import registrogastosRoutes from "./routes/registrogastos.routes.js";
import userRoutes from "./routes/user.routes.js";
import productsRouter from "./routes/products.js";
import salesRouter from "./routes/sales.js"; 


// Configuración de entorno
dotenv.config();

// Crear la app de Express
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/inventario", inventarioRoutes);
app.use("/api", reportesRoutes);
app.use("/reportegastos", reportegastosRoutes);
app.use("/registrogastos", registrogastosRoutes);
app.use("/api/users", userRoutes); 
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);

// Archivos estáticos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // mejor usar process.cwd() en ESM

// Ruta básica
app.get("/", (req, res) => {
  res.send("✅ Bienvenido a la API de Emprendly");
});

// Exportar la app
export default app;
