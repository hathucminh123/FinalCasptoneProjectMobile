declare module 'html2pdf.js' {
    interface Html2PdfImageOptions {
      type?: 'jpeg' | 'png' | 'webp';
      quality?: number; // từ 0 đến 1, đại diện cho chất lượng của hình ảnh
    }
  
    interface Html2CanvasOptions {
      scale?: number;
      logging?: boolean;
      width?: number;
      height?: number;
      useCORS?: boolean; // Để hỗ trợ lấy nội dung từ các nguồn khác
    }
  
    interface JsPDFOptions {
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
      orientation?: 'portrait' | 'landscape';
    }
  
    interface Html2PdfOptions {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: Html2PdfImageOptions;
      html2canvas?: Html2CanvasOptions;
      jsPDF?: JsPDFOptions;
    }
  
    interface Html2Pdf {
      from(element: HTMLElement | string): this;
      save(filename?: string): void;
      toPdf(): Promise<this>;
      set(options: Html2PdfOptions): this;
    }
  
    const html2pdf: () => Html2Pdf;
    export default html2pdf;
  }
  