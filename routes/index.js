const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // Asegúrate de importar Prisma
const isAuthenticated = require('../middlewares/isAuthenticated');
const isAdmin = require('../middlewares/isAdmin');

// Rutas de autenticación y administración
router.use('/auth', require('./auth'));
router.use('/admin', isAdmin, require('./admin'));

// Ruta de perfil del usuario
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    const { email, id } = req.user; // Obtén el ID y el email del usuario autenticado

    // Obtén los posts del usuario autenticado
    const userPosts = await prisma.post.findMany({
      where: { authorId: id }, // Busca posts donde el autor sea el usuario actual
      orderBy: { createdAt: 'desc' }, // Ordena por fecha de creación
    });

    // Renderiza la vista del perfil con los posts del usuario
    res.render('profile', { email, posts: userPosts });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    res.status(500).send('Error al cargar el perfil');
  }
});

// Ruta principal para listar posts
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: true }, // Incluye información del autor
    });

    res.render('index', {
      title: 'Foro de videojuegos',
      user: req.user, // Información completa del usuario autenticado, incluyendo el rol
      posts, // Lista de posts
    });
  } catch (error) {
    console.error('Error al cargar los posts:', error);
    res.status(500).send('Error al cargar los posts');
  }
});


router.get('/profile/:id', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.id; // ID del usuario cuya página se está visitando

    // Obtén la información del usuario visitado
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }, // Incluye los campos necesarios
    });

    if (!user) {
      return res.status(404).send('Usuario no encontrado');
    }

    // Obtén los posts del usuario visitado
    const userPosts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });

    // Renderiza la vista del perfil con los posts del usuario visitado
    res.render('public-profile', { user, posts: userPosts });
  } catch (error) {
    console.error('Error al cargar el perfil público:', error);
    res.status(500).send('Error al cargar el perfil público');
  }
});




module.exports = router;

