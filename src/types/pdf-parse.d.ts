declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: Record<string, any>;
  }
  function pdf(buffer: Buffer): Promise<PDFData>;
  export default pdf;
}
