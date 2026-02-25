import pdf from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractTextFromFile(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const ext = fileName.toLowerCase().split('.').pop();

  if (ext === 'pdf') {
    return extractFromPDF(buffer);
  } else if (ext === 'docx') {
    return extractFromDOCX(buffer);
  }

  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text.trim();
  } catch (e) {
    console.error('PDF parse error:', e);
    throw new Error('Failed to parse PDF file.');
  }
}

async function extractFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  } catch (e) {
    console.error('DOCX parse error:', e);
    throw new Error('Failed to parse DOCX file.');
  }
}
