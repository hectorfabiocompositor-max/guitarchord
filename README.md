# 🎸 Guitar Chord Extractor (PWA)

Una aplicación web moderna que utiliza **Google Gemini AI** para analizar archivos de audio, transcribir la letra y generar automáticamente los acordes de guitarra alineados.

![Guitar Chord Extractor](https://cdn-icons-png.flaticon.com/512/3844/3844724.png)

## ✨ Características

- 🎵 **Análisis de Audio**: Sube archivos MP3, WAV, M4A, etc. (máx. 25MB).
- 🎸 **Detección de Acordes**: Identifica los acordes y los coloca exactamente sobre la sílaba correcta.
- 🎼 **Sugerencia de Capotrasto**: Indica en qué traste colocar el capo para facilitar la ejecución.
- 🥁 **Patrón de Rasgueo**: Incluye una guía visual del rasgueo (flechas ↓ ↑).
- 🌍 **Multilingüe**: Detecta el idioma de la canción y genera las instrucciones en ese idioma (Español/Inglés).
- 📄 **Exportación a PDF**: Descarga la partitura en un PDF con fuente monoespaciada para mantener la alineación.
- 📱 **PWA (Instalable)**: Instálala en tu móvil o escritorio como una aplicación nativa.
- 🔒 **Privacidad**: Los archivos se procesan directamente con la API de Gemini.

## 🚀 Instalación Local

Si quieres correr esta aplicación en tu propia máquina:

### 1. Requisitos
- [Node.js](https://nodejs.org/) (v18+)
- Una API Key de [Google AI Studio](https://aistudio.google.com/app/apikey) (Gratis).

### 2. Configuración
1. Clona este repositorio o descarga el ZIP.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_GEMINI_API_KEY="TU_LLAVE_AQUI"
   ```

### 3. Ejecución
Inicia el servidor de desarrollo:
```bash
npm run dev
```
Abre `http://localhost:5173` en tu navegador.

## 🛠️ Tecnologías Usadas

- **React 18** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS** (Estilos)
- **Google Gemini AI SDK** (@google/genai)
- **jsPDF** (Generación de PDF)
- **Lucide React** (Iconos)

## 📄 Licencia

MIT License - Siéntete libre de usarlo y mejorarlo.

---
Desarrollado con ❤️ para músicos.
