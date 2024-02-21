# API Reference

## Books
/api/book

Esta API permite realizar operaciones CRUD sobre los libros del sistema.

- **POST /api/book**: Crear un nuevo libro.
- **GET /api/book/search/:query**: Buscar libros por título, autor o ISBN.
- **PATCH /api/book/:isbn**: Actualizar un libro.
- **DELETE /api/book/:isbn**: Eliminar un libro.

## Authentincation
/api/auth

Esta es la API de autenticación de usuarios. Permite registrar un nuevo usuario, autenticar una sesión y actualizar los datos de un usuario.

- **POST /api/auth/register**: Registrar un nuevo usuario.
- **POST /api/auth/login**: Autenticar sesión de usuario.
- **PATCH /api/auth**: Actualizar datos de usuario.

## Lendings
/api/lending

Esta API permite realizar operaciones CRUD sobre los préstamos de libros a los usuarios.

- **POST /api/lending/:isbn**: Crear un nuevo préstamo de un libro al usuario autenticado.
- **POST /api/lending/return/:id**: Hacer la devolución de un libro prestado al usuario autenticado según el id del préstamo.
- **GET /api/lending/:userId**: Listar todos los préstamos del usuario seleccionado.