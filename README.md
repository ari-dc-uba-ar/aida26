# aida26

## Sistema de Gestión Académica - Exactas UBA

Este sistema permite gestionar alumnos, materias e inscripciones para la facultad.

### Requisitos
- Node.js (v18+)
- PostgreSQL

### Configuración
1. **Base de Datos**: Ejecutar el script en `database/init.sql` para crear las tablas.
2. **Backend**:
   - Navegar a `backend/`
   - `npm install`
   - `npm run dev`
3. **Frontend**:
   - Navegar a `frontend/`
   - `npm install` (usando Vite o un servidor estático simple)
   - `npm run dev`

### Estructura de Datos
- **Alumnos**: La clave primaria es la Libreta Universitaria (ingreso manual).
- **Materias**: Clave primaria `cod_mat`.
- **Inscripciones**: Clave primaria compuesta por `libreta` y `cod_mat`.

### Multi-idioma
El sistema soporta Español e Inglés. El cambio se realiza dinámicamente desde la interfaz.