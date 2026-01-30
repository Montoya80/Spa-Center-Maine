
# Maine SPA Center - Clinical Management App

Esta es una aplicación profesional para la gestión de clínicas de belleza, spas y centros estéticos. Permite el control de citas, expedientes clínicos con IA, inventario retail y portal de clientes.

## 🚀 Despliegue Rápido (GitHub + Vercel)

1. **Crear Repositorio en GitHub**: 
   Sube todos estos archivos a un nuevo repositorio privado o público.

2. **Conectar con Vercel**:
   - Ve a [Vercel.com](https://vercel.com).
   - Importa tu repositorio de GitHub.
   - Vercel detectará automáticamente la configuración y desplegará la App con un dominio SSL gratuito.

## ☁️ Configuración de Supabase (Base de Datos Cloud)

Para que los datos se guarden permanentemente en la nube, sigue estos pasos:

1. Crea una cuenta gratuita en [Supabase.com](https://supabase.com).
2. Crea un nuevo proyecto llamado `MaineSPA`.
3. Ve a la sección **SQL Editor** y pega el esquema que aparece en la App (Sección Configuración > Infraestructura).
4. Copia tu `Project URL` y `Anon Public Key`.
5. En la App de Maine SPA, entra como Administrador, ve a **Configuración Maestro**, selecciona **Infraestructura** y pega tus llaves.
6. ¡Listo! Tus datos ahora se sincronizan automáticamente.

## ✨ Características Principales

- **IA Dermatológica**: Integración con Google Gemini para sugerencias de tratamientos personalizados basados en el tipo de piel del paciente.
- **Portal de Clientes**: Los pacientes pueden ver su historial, fotos de progreso y agendar citas de forma autónoma.
- **Control de Inventario**: Alerta de stock bajo para insumos profesionales y productos de venta.
- **Seguridad**: Diferenciación de roles entre Dueño, Recepción, Especialistas y Clientes.

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + Tailwind CSS.
- **Iconos**: Lucide React.
- **Base de Datos**: Supabase (PostgreSQL).
- **IA**: Google Gemini API.

---
Desarrollado con ❤️ para Maine SPA Center.
