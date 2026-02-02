import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportReportButtonProps {
  contentSelector?: string;
  title?: string;
}

export function ExportReportButton({ 
  contentSelector = 'main',
  title = 'Relatório de Clipping'
}: ExportReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const content = document.querySelector(contentSelector) as HTMLElement;
      if (!content) {
        console.error('Conteúdo não encontrado');
        return;
      }

      // Create PDF in landscape for better chart visualization
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text(title, margin, 20);

      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, margin, 28);

      let currentY = 38;

      // Get all dashboard sections
      const sections = content.querySelectorAll('[id]');
      
      for (const section of Array.from(sections)) {
        const sectionElement = section as HTMLElement;
        
        // Skip empty or non-visible sections
        if (sectionElement.offsetHeight === 0) continue;

        try {
          const canvas = await html2canvas(sectionElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if we need a new page
          if (currentY + imgHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 10;
        } catch (err) {
          console.error('Erro ao capturar seção:', err);
        }
      }

      // Add footer to all pages
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Página ${i} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      pdf.save(`relatorio-clipping-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      variant="outline"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Exportar Relatório
        </>
      )}
    </Button>
  );
}
