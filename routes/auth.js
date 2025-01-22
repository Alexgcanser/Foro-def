const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

/**
 * Registro de usuario
 */
router.post("/register", async (req, res) => {
  try {
    // Encripta la contraseña del usuario
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Crea el usuario en la base de datos
    const newUser = await prisma.user.create({
      data: {
        name: req.body.name, // Guarda el nombre de usuario
        email: req.body.email,
        password: hashedPassword,
      },
    });

    console.log("Usuario registrado:", newUser); // Log para depuración
    res.redirect("/auth/login-page");
  } catch (error) {
    console.error("Error al registrar usuario:", error); // Log del error
    res.redirect("/auth/register-page");
  }
});

/**
 * Autenticación de usuario
 */
router.post(
  "/login",
  (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error en la autenticación:", err);
        return next(err); // Manejo de errores
      }
      if (!user) {
        req.flash("error", info?.message || "Credenciales inválidas");
        return res.redirect("/auth/login-page"); // Redirige en caso de fallo
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Error al iniciar sesión:", err);
          return next(err);
        }
        // Redirige al inicio si todo está correcto
        return res.redirect("/");
      });
    })(req, res, next);
  }
);

/**
 * Página de inicio de sesión
 */
router.get("/login-page", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

/**
 * Página de registro
 */
router.get("/register-page", (req, res) => {
  res.render("register", { error: req.flash("error") });
});

module.exports = router;

