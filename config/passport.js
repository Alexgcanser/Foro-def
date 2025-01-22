const LocalStrategy = require("passport-local").Strategy;
const passport = require("passport");
const prisma = require("../prisma");
const bcrypt = require("bcrypt");

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email', // Por defecto passport usa username y password, con esto le decimos que use email y password
      passwordField: 'password' // Estos valores son los nombres de los valores del form de login o register
    },
    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { email: email },
        });
        if (!user) {
          return done(null, false, { message: "Usuario no encontrado" });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, { message: "Contraseña incorrecta" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role, email: user.email }); // Incluye el rol aquí
});

passport.deserializeUser(async (user, done) => {
  try {
    const foundUser = await prisma.user.findUnique({
      where: { id: user.id },
    });
    done(null, foundUser); // Devuelve el usuario completo con todos los campos, incluido `role`
  } catch (error) {
    done(error);
  }
});

