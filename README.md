# Ejercicio: Sistema de Gestión de Biblioteca

**Objetivo**: Desarrollar una API REST para un sistema de gestión de biblioteca que permita a los usuarios buscar libros, realizar préstamos y devoluciones, y gestionar usuarios.

## Requisitos Funcionales
1. **Gestión de Libros**:
	- [X] **Crear libros**: Permitir registrar nuevos libros en el sistema con los siguientes datos: título, autor(es), ISBN, y cantidad disponible.
	- [X] **Buscar libros**: Habilitar la búsqueda de libros por título, autor o ISBN. Debe retornar una lista de libros que coincidan con los criterios de búsqueda.
	- [X] **Actualizar libros**: Permitir actualizar la información de un libro existente.
	- [X] **Eliminar libros**: Permitir eliminar un libro del sistema.
2. **Préstamos**:
	- [X] **Realizar préstamo**: Permitir a un usuario realizar el préstamo de un libro. Se debe verificar la disponibilidad del libro.
	- [X] **Devolución de libros**: Habilitar la devolución de libros prestados.
	- [X] **Historial de préstamos**: Permitir consultar el historial de préstamos de un usuario.
3. **Gestión de Usuarios**:
	- [X] **Registro de usuarios**: Permitir el registro de nuevos usuarios con información básica como nombre, correo electrónico y contraseña.
	- [X] **Autenticación de usuarios**: Implementar un sistema de autenticación para permitir a los usuarios acceder a sus cuentas.
	- [X] **Actualizar perfil**: Permitir a los usuarios actualizar su información de perfil.

## Requisitos No Funcionales

- [X] **Autenticación y Seguridad**: Implementar autenticación JWT (JSON Web Tokens) para proteger los endpoints que requieran acceso autenticado.
- [X] **Persistencia de Datos**: Utilizar una base de datos de tu elección (por ejemplo, MySQL, PostgreSQL, MongoDB) para almacenar la información de libros, préstamos y usuarios.
- [X] **Documentación**: Documentar la API utilizando herramientas como Swagger o Postman para facilitar el entendimiento y uso de la API por parte de otros desarrolladores.


## Bonus

**Tests**: Escribe pruebas unitarias y de integración para tu API.
  - [ ] **Pruebas Unitarias**: Escribe pruebas para verificar el comportamiento de las funciones y métodos de tu aplicación.
  - [ ] **Pruebas de Integración**: Escribe pruebas para verificar el comportamiento de los endpoints de tu API.
  - [X] **Pruebas E2E**: Escribe pruebas de extremo a extremo para verificar el comportamiento de la API en su conjunto.


**Contenedorización**: 
  - [ ] Dockeriza tu aplicación para facilitar su despliegue y ejecución en diferentes entornos.

Este ejercicio es una excelente manera de practicar y demostrar tus habilidades en el desarrollo d APIs REST, desde la planificación y diseño hasta la implementación y documentación. Puedes elegir el lenguaje de programación que prefieras, pero algunos populares para el desarrollo de backend incluyen Node.js, Python (con frameworks como Flask o Django), y Java (con Spring Boot).