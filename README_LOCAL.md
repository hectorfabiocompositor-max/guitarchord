# Guía de Instalación Local - Guitar Chord Extractor

Sigue estos pasos para ejecutar esta aplicación en tu propia computadora:

## 1. Requisitos Previos
Asegúrate de tener instalado **Node.js** (versión 18 o superior) en tu sistema. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).

## 2. Descargar el Código
Si has exportado este proyecto a GitHub o descargado el ZIP:
1. Abre una terminal o consola.
2. Navega hasta la carpeta del proyecto.

## 3. Instalar Dependencias
Ejecuta el siguiente comando para instalar todas las librerías necesarias:
```bash
npm install
```

## 4. Configurar la API Key
Para que la IA funcione, necesitas tu propia llave de Gemini:
1. Obtén una llave gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).
2. En la carpeta raíz del proyecto, crea un archivo llamado `.env` (puedes copiar el contenido de `.env.example`).
3. Abre el archivo `.env` y pega tu llave así:
   ```env
   GEMINI_API_KEY="TU_LLAVE_AQUI"
   ```

## 5. Ejecutar la Aplicación
Inicia el servidor de desarrollo con:
```bash
npm run dev
```
La terminal te dará una dirección (normalmente `http://localhost:5173`). Ábrela en tu navegador.

## 6. Instalar como App (Opcional)
Una vez que la aplicación esté corriendo en tu navegador:
1. Verás un botón en la parte superior que dice **"Instalar App en el dispositivo"**.
2. Haz clic en él para instalarla como una aplicación de escritorio en tu máquina.

---
**Nota:** Esta aplicación utiliza Vite para el desarrollo y Tailwind CSS para los estilos. Todo está configurado para funcionar de inmediato una vez que agregues tu API Key.
