import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Game } from '../types';

/**
 * Export game data as PDF report
 */
export const exportToPDF = async (
  game: Game,
  chartElement: HTMLElement
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Page 1: Shot Chart
    pdf.setFontSize(20);
    pdf.text('Shot Chart', pageWidth / 2, 15, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`${game.homeTeam} vs ${game.awayTeam}`, pageWidth / 2, 22, { align: 'center' });
    pdf.text(new Date(game.date).toLocaleDateString(), pageWidth / 2, 28, { align: 'center' });

    // Capture shot chart
    const canvas = await html2canvas(chartElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, Math.min(imgHeight, pageHeight - 45));

    // Page 2: Game Summary Statistics
    pdf.addPage();
    pdf.setFontSize(20);
    pdf.text('Game Summary', pageWidth / 2, 15, { align: 'center' });

    const homeShots = game.shots.filter(s => s.team === 'home');
    const awayShots = game.shots.filter(s => s.team === 'away');
    
    const homeGoals = homeShots.filter(s => s.result === 'goal').length;
    const awayGoals = awayShots.filter(s => s.result === 'goal').length;

    let yPos = 30;
    pdf.setFontSize(14);
    pdf.text(`${game.homeTeam} (Home)`, 15, yPos);
    yPos += 8;
    pdf.setFontSize(12);
    pdf.text(`Total Shots: ${homeShots.length}`, 20, yPos);
    yPos += 6;
    pdf.text(`Goals: ${homeGoals}`, 20, yPos);
    yPos += 6;
    pdf.text(`Shooting %: ${homeShots.length > 0 ? ((homeGoals / homeShots.length) * 100).toFixed(1) : 0}%`, 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(14);
    pdf.text(`${game.awayTeam} (Away)`, 15, yPos);
    yPos += 8;
    pdf.setFontSize(12);
    pdf.text(`Total Shots: ${awayShots.length}`, 20, yPos);
    yPos += 6;
    pdf.text(`Goals: ${awayGoals}`, 20, yPos);
    yPos += 6;
    pdf.text(`Shooting %: ${awayShots.length > 0 ? ((awayGoals / awayShots.length) * 100).toFixed(1) : 0}%`, 20, yPos);

    // Shots by period
    yPos += 15;
    pdf.setFontSize(14);
    pdf.text('Shots by Period', 15, yPos);
    yPos += 8;
    pdf.setFontSize(12);
    const periods = [1, 2, 3, 'OT'] as const;
    periods.forEach(period => {
      const homePeriodShots = homeShots.filter(s => s.period === period).length;
      const awayPeriodShots = awayShots.filter(s => s.period === period).length;
      if (homePeriodShots > 0 || awayPeriodShots > 0) {
        pdf.text(`Period ${period}: ${game.homeTeam} ${homePeriodShots}, ${game.awayTeam} ${awayPeriodShots}`, 20, yPos);
        yPos += 6;
      }
    });

    // Page 3: Detailed Shot List
    if (game.shots.length > 0) {
      pdf.addPage();
      pdf.setFontSize(20);
      pdf.text('Shot Details', pageWidth / 2, 15, { align: 'center' });

      yPos = 25;
      pdf.setFontSize(10);
      
      game.shots.forEach((shot, index) => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }

        const periodLabel = shot.period === 'OT' ? 'OT' : `P${shot.period}`;
        const text = `${index + 1}. ${periodLabel} ${shot.team.toUpperCase()} - ${shot.result}`;
        pdf.text(text, 15, yPos);
        yPos += 5;
      });
    }

    // Save PDF
    pdf.save(`${game.homeTeam}-vs-${game.awayTeam}-${new Date(game.date).toLocaleDateString()}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
};
