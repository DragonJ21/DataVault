import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { storage } from '../storage';

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json';
  sections: string[];
}

export async function exportUserData(userId: string, options: ExportOptions): Promise<Buffer | string> {
  const userData = await gatherUserData(userId, options.sections);

  switch (options.format) {
    case 'pdf':
      return generatePDF(userData);
    case 'csv':
      return generateCSV(userData);
    case 'excel':
      return generateExcel(userData);
    case 'json':
      return JSON.stringify(userData, null, 2);
    default:
      throw new Error('Invalid export format');
  }
}

async function gatherUserData(userId: string, sections: string[]) {
  const data: any = {};

  if (sections.includes('personal')) {
    data.personalInfo = await storage.getPersonalInfo(userId);
  }
  if (sections.includes('travel')) {
    data.travelHistory = await storage.getTravelHistory(userId);
  }
  if (sections.includes('flights')) {
    data.flights = await storage.getFlights(userId);
  }
  if (sections.includes('employers')) {
    data.employers = await storage.getEmployers(userId);
  }
  if (sections.includes('education')) {
    data.education = await storage.getEducation(userId);
  }
  if (sections.includes('addresses')) {
    data.addresses = await storage.getAddresses(userId);
  }

  return data;
}

function generatePDF(data: any): Buffer {
  const doc = new jsPDF();
  let yPosition = 20;

  doc.setFontSize(18);
  doc.text('Personal Data Export', 20, yPosition);
  yPosition += 20;

  // Add sections to PDF
  Object.keys(data).forEach(section => {
    if (data[section]) {
      doc.setFontSize(14);
      doc.text(section.charAt(0).toUpperCase() + section.slice(1), 20, yPosition);
      yPosition += 10;

      if (Array.isArray(data[section])) {
        data[section].forEach((item: any, index: number) => {
          doc.setFontSize(10);
          const text = Object.entries(item)
            .filter(([key]) => key !== 'id' && key !== 'user_id')
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          doc.text(`${index + 1}. ${text}`, 25, yPosition);
          yPosition += 8;
          
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
        });
      } else {
        doc.setFontSize(10);
        const text = Object.entries(data[section])
          .filter(([key]) => key !== 'id' && key !== 'user_id')
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        doc.text(text, 25, yPosition);
        yPosition += 8;
      }
      yPosition += 10;
    }
  });

  return Buffer.from(doc.output('arraybuffer'));
}

function generateCSV(data: any): string {
  let csv = '';

  Object.keys(data).forEach(section => {
    if (data[section]) {
      csv += `\n${section.toUpperCase()}\n`;
      
      if (Array.isArray(data[section]) && data[section].length > 0) {
        const headers = Object.keys(data[section][0])
          .filter(key => key !== 'id' && key !== 'user_id');
        csv += headers.join(',') + '\n';
        
        data[section].forEach((item: any) => {
          const row = headers.map(header => item[header] || '').join(',');
          csv += row + '\n';
        });
      } else if (!Array.isArray(data[section])) {
        const headers = Object.keys(data[section])
          .filter(key => key !== 'id' && key !== 'user_id');
        csv += headers.join(',') + '\n';
        const row = headers.map(header => data[section][header] || '').join(',');
        csv += row + '\n';
      }
    }
  });

  return csv;
}

function generateExcel(data: any): Buffer {
  const workbook = XLSX.utils.book_new();

  Object.keys(data).forEach(section => {
    if (data[section]) {
      let worksheet;
      
      if (Array.isArray(data[section])) {
        const cleanData = data[section].map((item: any) => {
          const { id, user_id, ...rest } = item;
          return rest;
        });
        worksheet = XLSX.utils.json_to_sheet(cleanData);
      } else {
        const { id, user_id, ...cleanData } = data[section];
        worksheet = XLSX.utils.json_to_sheet([cleanData]);
      }
      
      XLSX.utils.book_append_sheet(workbook, worksheet, section);
    }
  });

  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
}
