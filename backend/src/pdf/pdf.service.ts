import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class PdfService {
  async extractPages(buffer: Buffer): Promise<string[]> {
    const parser = new PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.pages.map(page => page.text);
    } finally {
      await parser.destroy();
    }
  }
}
