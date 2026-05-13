import { extractText, getDocumentProxy } from 'unpdf';

export async function extractTextFromPdf(buffer) {
  try {
    const uint8Array = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(uint8Array, {
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/standard_fonts/',
    });
    const { text } = await extractText(pdf, { mergePages: true });
    return String(text || '').trim();
  } catch (err) {
    console.error('PDF extraction error:', err);
    return '';
  }
}
