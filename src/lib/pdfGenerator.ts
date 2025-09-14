export interface PDFOptions {
  filename?: string;
  margin?: number | number[];
}

// Lightweight stub for generateLegalDocumentPDF used in Terms & Privacy pages.
// This avoids importing heavy browser-only dependencies during dev hot-reload.
export const generateLegalDocumentPDF = async (
  content: HTMLElement | string,
  docType: 'terms' | 'privacy' = 'terms',
  lastUpdated?: string
): Promise<void> => {
  // In browser runtime we can open a new window and print.
  // For dev server, we just create a Blob and open it as a data URL for preview.
  try {
    let htmlString = '';
    if (typeof content === 'string') {
      htmlString = content;
    } else if (content instanceof HTMLElement) {
      htmlString = content.outerHTML;
    } else {
      htmlString = '<div>Document</div>';
    }

    const fullHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${docType}</title></head><body>${htmlString}</body></html>`;

    // Create a blob and open in a new window for user to print/save
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Try to open in new window if available
    if (typeof window !== 'undefined' && window.open) {
      const newWin = window.open(url, '_blank');
      if (!newWin) {
        // Fallback to navigate in same window
        window.location.href = url;
      }
    }

    // Revoke URL after a short delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error);
  }
};
