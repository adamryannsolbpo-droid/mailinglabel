import jsPDF from 'jspdf';
import { LabelData, LabelTemplate } from '../types';

export const generatePDF = (labels: LabelData[], template: LabelTemplate) => {
  // jsPDF unit: inches for easier Avery mapping
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: 'letter' // 8.5 x 11
  });

  doc.setFont("helvetica", "bold");
  // Font size is set dynamically per line

  let labelCount = 0;
  let pageCount = 1;

  labels.forEach((label, index) => {
    // Calculate Grid Position
    const labelsPerPage = template.rows * template.cols;
    const positionOnPage = index % labelsPerPage;
    
    // Add new page if needed
    if (index > 0 && positionOnPage === 0) {
      doc.addPage();
      pageCount++;
    }

    const row = Math.floor(positionOnPage / template.cols);
    const col = positionOnPage % template.cols;

    // Calculate Coordinates
    // X = LeftMargin + (Col * (Width + Gap))
    const x = template.marginLeft + (col * (template.labelWidth + template.horizontalGap));
    
    // Y = TopMargin + (Row * (Height + Gap))
    const y = template.marginTop + (row * (template.labelHeight + template.verticalGap));

    // Center Logic
    const centerX = x + (template.labelWidth / 2);
    const centerY = y + (template.labelHeight / 2);

    // Prepare Text
    // 3 lines: Name, Address, City/State/Zip
    // Filter out empty lines (e.g. missing address2) to keep spacing tight
    const lines = [
      label.name,
      label.address1,
      label.address2,
      `${label.city}, ${label.state} ${label.zip}`
    ].filter(Boolean) as string[];

    // Calculate vertical offset to center the block of text
    const lineHeight = template.fontSize / 72; // Points to inches approx
    const lineSpacing = 1.2;
    const totalTextBlockHeight = lines.length * (lineHeight * lineSpacing);
    
    // Start Y (Baseline of first line)
    // CenterY - HalfHeight + (LineHeight adjustment for baseline)
    let currentY = centerY - (totalTextBlockHeight / 2) + (lineHeight * 0.8);

    const maxLineWidth = template.labelWidth - 0.25; // Safe margin (0.125" each side)

    lines.forEach((line) => {
      // 1. Reset to default size to measure true width
      doc.setFontSize(template.fontSize);
      const textWidth = doc.getTextWidth(line);
      
      // 2. Check if text fits; if not, scale down
      if (textWidth > maxLineWidth) {
        const scaleFactor = maxLineWidth / textWidth;
        const newFontSize = Math.max(template.fontSize * scaleFactor, 5); // Minimum 5pt to prevent invisibility
        doc.setFontSize(newFontSize);
      }

      // 3. Render text centered
      // We removed maxWidth to prevent wrapping; scaling handles the width now.
      doc.text(line, centerX, currentY, { align: 'center' });
      
      // 4. Move to next line
      // Note: We use the *original* line height for spacing to maintain vertical rhythm
      // regardless of whether a specific line was scaled down.
      currentY += (lineHeight * lineSpacing);
    });

    labelCount++;
  });

  doc.save(`mailing_labels_${template.id}_${new Date().toISOString().slice(0,10)}.pdf`);
};