const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const { create } = require('express-handlebars');
const session = require('express-session');
const methodOverride = require('method-override');
const passport = require('passport');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const PORT = process.env.PORT || 3000;
const postRoutes = require('./routes/posts');
const swaggerDocs = require('./config/swagger').swaggerDocs;
const swaggerUi = require('./config/swagger').swaggerUi;

const hbs = create({
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: require('./utils/helpers'),
});

require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const indexRouter = require('./routes/index');

const app = express();

// Configuración de sesión
app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'Session',
    }),
    secret: process.env.SESSION_SECRET || 'SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    },
  })
);

// Configuración del motor de vistas
app.engine('hbs', hbs.engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');
require('./config/cloudinary');

// Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas
app.use('/', indexRouter);
app.use('/posts', postRoutes);

// Manejo de rutas no encontradas (404)
app.use(function (req, res, next) {
  console.log("404 - Ruta no encontrada:", req.url); // Log de depuración
  next(createError(404));
});

// Middleware de manejo de errores
app.use(function (err, req, res, next) {
  if (res.headersSent) {
    console.error("Error: Los headers ya se enviaron.");
    return next(err);
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

