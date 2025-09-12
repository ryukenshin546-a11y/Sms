import html2pdf from 'html2pdf.js';

export interface PDFOptions {
  filename?: string;
  margin?: number | number[];
  image?: {
    type?: string;
    quality?: number;
  };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string;
    width?: number;
    height?: number;
    windowWidth?: number;
    windowHeight?: number;
  };
  jsPDF?: {
    unit?: string;
    format?: string | number[];
    orientation?: string;
    compress?: boolean;
  };
}

export const generatePDF = async (
  element: HTMLElement,
  options: PDFOptions = {}
): Promise<void> => {
  const defaultOptions: PDFOptions = {
    filename: 'document.pdf',
    margin: [10, 10, 10, 10],
    image: {
      type: 'jpeg',
      quality: 0.98
    },
    html2canvas: {
      scale: 4, // เพิ่ม scale เพื่อความคมชัดสูงสุด
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      windowHeight: 2000, // เพิ่มความสูงสำหรับเนื้อหาที่ยาว
      width: 1200,
      height: 2000
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    }
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    // เพิ่ม CSS สำหรับ PDF
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@300;400;500;600;700&display=swap');

      * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      body {
        font-family: 'Noto Sans Thai', 'Sarabun', Arial, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.6 !important;
        color: #000000 !important;
        background-color: #ffffff !important;
      }

      h1, h2, h3, h4, h5, h6 {
        font-weight: bold !important;
        color: #1e40af !important;
        page-break-after: avoid !important;
      }

      p {
        margin-bottom: 10px !important;
        text-align: justify !important;
      }

      ul, ol {
        margin-left: 20px !important;
        margin-bottom: 10px !important;
      }

      li {
        margin-bottom: 5px !important;
      }

      .pdf-hide {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    await html2pdf()
      .set(finalOptions)
      .from(element)
      .save();

    // ลบ style ที่เพิ่มเข้าไป
    document.head.removeChild(style);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('ไม่สามารถสร้าง PDF ได้ กรุณาลองใหม่อีกครั้ง');
  }
};

export const generateLegalDocumentPDF = async (
  contentElement: HTMLElement,
  documentType: 'terms' | 'privacy',
  lastUpdated: string
): Promise<void> => {
  const filename = documentType === 'terms'
    ? `ข้อกำหนดการใช้งาน-${lastUpdated.replace(/\s/g, '-')}.pdf`
    : `นโยบายความเป็นส่วนตัว-${lastUpdated.replace(/\s/g, '-')}.pdf`;

  // สร้าง element ใหม่สำหรับ PDF ที่มีเฉพาะเนื้อหาที่ต้องการ
  const pdfContent = createPDFContent(contentElement, documentType, lastUpdated);

  const options: PDFOptions = {
    filename,
    margin: [20, 20, 20, 20], // เพิ่ม margin
    image: {
      type: 'jpeg',
      quality: 0.95
    },
    html2canvas: {
      scale: 3, // เพิ่ม scale สำหรับความคมชัด
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      windowHeight: 1600 // เพิ่มความสูงสำหรับเนื้อหาที่ยาว
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
      compress: true
    }
  };

  await generatePDF(pdfContent, options);
};

// ฟังก์ชันสำหรับสร้างเนื้อหา PDF ที่เฉพาะเจาะจง
const createPDFContent = (
  originalElement: HTMLElement,
  documentType: 'terms' | 'privacy',
  lastUpdated: string
): HTMLElement => {
  // ใช้ originalElement โดยตรงแทนการค้นหา #main-content
  const pdfContainer = originalElement.cloneNode(true) as HTMLElement;

  // จัดการ styles สำหรับ PDF
  applyPDFStyles(pdfContainer);

  return pdfContainer;
};

// ฟังก์ชันสำหรับปรับแต่ง styles สำหรับ PDF
const applyPDFStyles = (element: HTMLElement): void => {
  // Reset styles ที่อาจรบกวน PDF
  const allElements = element.querySelectorAll('*');
  allElements.forEach(el => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.boxShadow = 'none';
    htmlEl.style.textShadow = 'none';
    htmlEl.style.transform = 'none';
    htmlEl.style.transition = 'none';
    htmlEl.style.animation = 'none';
  });

  // จัดการ headings
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach(heading => {
    const htmlHeading = heading as HTMLElement;
    htmlHeading.style.fontWeight = 'bold';
    htmlHeading.style.marginTop = '20px';
    htmlHeading.style.marginBottom = '10px';
    htmlHeading.style.color = '#1e40af';
    htmlHeading.style.pageBreakAfter = 'avoid';
  });

  // จัดการ paragraphs
  const paragraphs = element.querySelectorAll('p');
  paragraphs.forEach(p => {
    const htmlP = p as HTMLElement;
    htmlP.style.marginBottom = '10px';
    htmlP.style.textAlign = 'justify';
  });

  // จัดการ lists
  const lists = element.querySelectorAll('ul, ol');
  lists.forEach(list => {
    const htmlList = list as HTMLElement;
    htmlList.style.marginLeft = '20px';
    htmlList.style.marginBottom = '10px';
  });

  // จัดการ list items
  const listItems = element.querySelectorAll('li');
  listItems.forEach(li => {
    const htmlLi = li as HTMLElement;
    htmlLi.style.marginBottom = '5px';
  });

  // จัดการ cards และ containers
  const cards = element.querySelectorAll('[class*="card"], [class*="border"]');
  cards.forEach(card => {
    const htmlCard = card as HTMLElement;
    htmlCard.style.border = '1px solid #e5e7eb';
    htmlCard.style.borderRadius = '8px';
    htmlCard.style.padding = '15px';
    htmlCard.style.marginBottom = '15px';
    htmlCard.style.backgroundColor = '#ffffff';
  });

  // จัดการ badges และ highlights
  const badges = element.querySelectorAll('[class*="badge"], [class*="bg-"]');
  badges.forEach(badge => {
    const htmlBadge = badge as HTMLElement;
    htmlBadge.style.backgroundColor = '#f3f4f6';
    htmlBadge.style.color = '#374151';
    htmlBadge.style.padding = '2px 8px';
    htmlBadge.style.borderRadius = '4px';
    htmlBadge.style.fontSize = '12px';
  });
};
