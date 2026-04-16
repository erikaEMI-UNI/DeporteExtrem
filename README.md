# DeporteExtrem

## Descripción

DeporteExtrem es una aplicación web diseñada para entusiastas de los deportes extremos. El sistema permite gestionar actividades, reservas, itinerarios y más, proporcionando una experiencia completa tanto para usuarios como para operadores. El proyecto está dividido en dos componentes principales: un backend que maneja la lógica del servidor y la API, y un frontend que ofrece una interfaz de usuario intuitiva y moderna.

## Estructura del Proyecto

```
DeporteExtrem/
├── BACKEND/
│   ├── config/
│   ├── controllers/
│   ├── data/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── FRONTEND/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
└── README.md
```

## Tecnologías Utilizadas

### Backend
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **Express.js**: Framework web para Node.js.
- **MongoDB**: Base de datos NoSQL.
- **Mongoose**: ODM para MongoDB.
- **JWT**: Autenticación basada en tokens.
- **bcryptjs**: Encriptación de contraseñas.
- **Multer**: Manejo de archivos multipart/form-data.
- **Nodemailer**: Envío de correos electrónicos.
- **Turf.js**: Librería para operaciones geoespaciales.

### Frontend
- **React**: Librería para construir interfaces de usuario.
- **Vite**: Herramienta de construcción rápida para proyectos modernos.
- **TailwindCSS**: Framework CSS utilitario.
- **Leaflet**: Librería para mapas interactivos.
- **Chart.js**: Librería para gráficos.
- **Axios**: Cliente HTTP para hacer peticiones.
- **React Router**: Enrutamiento para aplicaciones React.
- **Framer Motion**: Librería para animaciones.

## Instalación

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn
- MongoDB (local o en la nube)

### Pasos de Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/DeporteExtrem.git
   cd DeporteExtrem
   ```

2. Instala las dependencias del backend:
   ```bash
   cd BACKEND
   npm install
   ```

3. Instala las dependencias del frontend:
   ```bash
   cd ../FRONTEND
   npm install
   ```

4. Configura las variables de entorno:
   - Crea un archivo `.env` en la carpeta `BACKEND` con las configuraciones necesarias (ej. conexión a MongoDB, JWT secret, etc.).

## Cómo Ejecutar

### Ejecutar el Backend
1. Navega a la carpeta del backend:
   ```bash
   cd BACKEND
   ```

2. Ejecuta el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```
   O en modo producción:
   ```bash
   npm start
   ```

   El servidor se ejecutará en `http://localhost:3000` (o el puerto configurado).

### Ejecutar el Frontend
1. Navega a la carpeta del frontend:
   ```bash
   cd FRONTEND
   ```

2. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:5173` (puerto por defecto de Vite).

## Ejemplos de Uso

- **Registro de Usuario**: Los usuarios pueden registrarse y acceder a actividades personalizadas.
- **Gestión de Actividades**: Operadores pueden crear y gestionar itinerarios de deportes extremos.
- **Reservas**: Usuarios pueden reservar actividades y ver su historial.
- **Mapas Interactivos**: Visualización de rutas y áreas de riesgo usando mapas integrados.
- **Reportes**: Generación de reportes sobre actividades y usuarios.

## Autor

Proyecto desarrollado por [Tu Nombre]. Para más información, contacta a [tu-email@example.com].