const express = require('express');
const router = express.Router();
const prisma = require('../prisma'); // Prisma ORM
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware de autenticación

// Ruta para crear un nuevo post
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const authorId = req.user.id; // Obtiene el ID del usuario autenticado
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });
    console.log('Nuevo post creado:', newPost);
    res.redirect('/'); // Redirige a la página principal después de crear el post
  } catch (error) {
    console.error('Error al crear el post:', error);
    res.status(500).send('Error al crear el post');
  }
});

// Ruta para mostrar el formulario de edición de un post
router.get('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).send('Post no encontrado');
    }

    // Permitir solo al autor o a los administradores
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('No tienes permiso para editar este post');
    }

    res.render('edit-post', { post }); // Renderiza la vista de edición con los datos del post
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    res.status(500).send('Error al cargar el formulario de edición');
  }
});

// Ruta para actualizar un post
router.post('/edit/:id', isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content } = req.body;

    // Permitir solo al autor o a los administradores
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).send('Post no encontrado');
    }

    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('No tienes permiso para editar este post');
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    console.log('Post actualizado:', updatedPost);
    res.redirect('/');
  } catch (error) {
    console.error('Error al actualizar el post:', error);
    res.status(500).send('Error al actualizar el post');
  }
});

// Ruta para eliminar un post
router.post('/delete/:id', isAuthenticated, async (req, res) => {
  try {
    const postId = req.params.id;

    // Permitir solo al autor o a los administradores
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).send('Post no encontrado');
    }

    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).send('No tienes permiso para eliminar este post');
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    console.log('Post eliminado:', postId);
    res.redirect('/');
  } catch (error) {
    console.error('Error al eliminar el post:', error);
    res.status(500).send('Error al eliminar el post');
  }
});

module.exports = router;


