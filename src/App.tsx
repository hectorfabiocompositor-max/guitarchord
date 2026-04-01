import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Upload, FileAudio, Loader2, Copy, RefreshCw, Music, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 25 * 1024 * 1024) {
        setError('El archivo es demasiado grande. El tamaño máximo es 25MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      if (droppedFile.size > 25 * 1024 * 1024) {
        setError('El archivo es demasiado grande. El tamaño máximo es 25MB.');
        return;
      }
      setFile(droppedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Por favor, sube un archivo de audio válido.');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:audio/xxx;base64, prefix
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const extractChords = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);

      const prompt = `Analyze this audio file which contains a song and extract the lyrics and guitar chords.

CRITICAL INSTRUCTION REGARDING FORMAT:
DO NOT include any conversational filler, introductory text, greetings, or general musical analysis.
DO NOT say "Here is the analysis" or explain the chord progression.
Start IMMEDIATELY with the Capo position, followed by the Strumming Pattern (Rasgueo), and then directly the song sections.
Return ONLY the standardized chord sheet.

CRITICAL INSTRUCTION REGARDING LANGUAGE:
Detect the language of the song. All section headers (like Verse/Verso, Chorus/Estribillo), Capo, and Strumming instructions MUST be in the same language as the song.

Your task is to:
1. Transcribe the lyrics of the song accurately.
2. Identify the guitar chords that should be played with each line of lyrics.
3. Format the output so that chords appear ABOVE the syllable/word where they should be played.
4. Suggest a capo position if it makes the chords easier to play or matches the original recording. State the capo position at the very beginning of the output (e.g., "Capo: 2nd fret" or "Capotrasto: traste 2").
5. Provide a brief, standardized description of the strumming pattern (rasgueo) or picking style used in the song right after the Capo position.

Output format requirements:
- State the Capo position at the very top.
- State the Strumming Pattern (Rasgueo) on the next line. Keep it concise (e.g., "Rasgueo: ↓ ↓ ↑ ↑ ↓ ↑ (Abajo, Abajo, Arriba, Arriba, Abajo, Arriba)" or "Strumming: D D U U D U").
- Each section should have the chord written on a separate line ABOVE the lyrics.
- Use proper spacing to align chords with the correct syllables.
- Include common guitar chords (C, D, E, F, G, A, B and their variations).
- Separate sections (verse, chorus) with blank lines and label them in the song's language.
- Be precise with timing - chords should be placed where they naturally transition in the song.

Example output format (if the song is in Spanish):
Capotrasto: traste 2 (o Sin capotrasto)
Rasgueo: ↓ ↓ ↑ ↑ ↓ ↑ (Abajo, Abajo, Arriba, Arriba, Abajo, Arriba)

Verso 1:
D
Años sin poder romper

G         A
esta soledad en mí,

D
la supiste deshacer

G        A
y ayudarme a revivir.

IMPORTANT INSTRUCTIONS:
- If the audio is NOT music (speech, podcast, etc.), still transcribe it and mention that no chords can be identified.
- If the audio quality is poor, do your best to transcribe and identify chords.
- Always provide the lyrics transcribed even if chord identification is uncertain.
- For instrumental parts, indicate with [Instrumental] or similar notation in the detected language.

Remember: NO INTRODUCTORY TEXT. JUST THE CAPO, STRUMMING PATTERN, AND THE CHORDS/LYRICS.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type || 'audio/mp3',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      });

      setResult(response.text || 'No se pudo generar el resultado.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocurrió un error al procesar el audio.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    
    // Set a monospace font so the chords align properly with the lyrics
    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    
    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(result, 180);
    
    let y = 20;
    const pageHeight = doc.internal.pageSize.height;
    
    lines.forEach((line: string) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 5; // Line height
    });
    
    const fileName = file?.name ? file.name.split('.')[0] : 'cancion';
    doc.save(`${fileName}_acordes.pdf`);
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center p-4 bg-rose-500/10 rounded-full mb-4">
            <Music className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent mb-4">
            Guitar Chord Extractor
          </h1>
          <p className="text-slate-400 text-lg">
            Extrae la letra y acordes de guitarra de cualquier canción usando IA
          </p>
        </header>

        {!process.env.GEMINI_API_KEY && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 text-amber-400 text-center">
            ⚠️ La API de Gemini no está configurada. Por favor, configura la variable de entorno GEMINI_API_KEY.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-red-400 text-center">
            {error}
          </div>
        )}

        {!result ? (
          <div className="space-y-8">
            <div
              className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 ${
                file
                  ? 'border-rose-500/50 bg-rose-500/5'
                  : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'
              }`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="audio/*"
                className="hidden"
              />
              
              {file ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-rose-500/20 rounded-full">
                    <FileAudio className="w-12 h-12 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-200">{file.name}</p>
                    <p className="text-sm text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      reset();
                    }}
                    className="text-sm text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Eliminar archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4 cursor-pointer">
                  <div className="p-4 bg-slate-800 rounded-full">
                    <Upload className="w-12 h-12 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-200">
                      Arrastra tu archivo de audio aquí
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      o haz clic para seleccionar un archivo
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-4">
                    Formatos soportados: MP3, WAV, M4A, AAC, OGG, FLAC (máx. 25MB)
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={extractChords}
                disabled={!file || loading || !process.env.GEMINI_API_KEY}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full hover:from-rose-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-rose-500 disabled:hover:to-orange-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Analizando audio...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5 mr-3" />
                    Extraer Acordes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-200 flex items-center">
                <FileAudio className="w-6 h-6 mr-3 text-rose-400" />
                Resultado
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </button>
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  {copied ? (
                    <span className="text-green-400 flex items-center">
                      ¡Copiado!
                    </span>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </button>
                <button
                  onClick={reset}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-200 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Nueva Canción
                </button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 md:p-8 overflow-x-auto shadow-xl">
              <pre className="font-mono text-sm md:text-base text-slate-300 whitespace-pre-wrap leading-relaxed">
                {result}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
