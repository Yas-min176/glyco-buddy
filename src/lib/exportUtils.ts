import { GlucoseReading, formatDate, getStatusLabel } from './glucoseCalculator';

export function generatePrintableHTML(readings: GlucoseReading[], patientName?: string): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
  
  const stats = calculateStats(readings);
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Histórico de Glicemia - ${patientName || 'Paciente'}</title>
  <style>
    @media print {
      @page {
        size: A4;
        margin: 1.5cm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none;
      }
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      color: #f59e0b;
      margin: 10px 0;
      font-size: 32px;
    }
    
    .header .logo {
      font-size: 48px;
      margin-bottom: 10px;
    }
    
    .info-section {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
    }
    
    .info-item {
      text-align: center;
    }
    
    .info-item strong {
      display: block;
      color: #f59e0b;
      font-size: 24px;
      margin-bottom: 5px;
    }
    
    .info-item span {
      color: #666;
      font-size: 12px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border-left: 4px solid #f59e0b;
    }
    
    .stat-card .value {
      font-size: 24px;
      font-weight: bold;
      color: #f59e0b;
      display: block;
      margin-bottom: 5px;
    }
    
    .stat-card .label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    thead {
      background: #f59e0b;
      color: white;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    
    tr:hover {
      background: #f9fafb;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-normal {
      background: #dcfce7;
      color: #166534;
    }
    
    .status-low {
      background: #fef3c7;
      color: #92400e;
    }
    
    .status-high {
      background: #fed7aa;
      color: #9a3412;
    }
    
    .status-critical {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .glucose-value {
      font-weight: bold;
      font-size: 16px;
    }
    
    .insulin-dose {
      color: #f59e0b;
      font-weight: 600;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    
    .print-button {
      background: #f59e0b;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin: 20px auto;
      display: block;
    }
    
    .print-button:hover {
      background: #d97706;
    }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir Relatório</button>
  
  <div class="header">
    <div class="logo">🐝</div>
    <h1>Beez - Relatório de Glicemia</h1>
    <p style="color: #666; margin: 5px 0;">${patientName || 'Paciente'}</p>
    <p style="color: #999; font-size: 13px;">Gerado em ${dateStr}</p>
  </div>
  
  <div class="info-section">
    <div class="info-item">
      <strong>${readings.length}</strong>
      <span>Total de Medições</span>
    </div>
    <div class="info-item">
      <strong>${new Date(readings[0]?.timestamp).toLocaleDateString('pt-BR')}</strong>
      <span>Primeira Medição</span>
    </div>
    <div class="info-item">
      <strong>${new Date(readings[readings.length - 1]?.timestamp).toLocaleDateString('pt-BR')}</strong>
      <span>Última Medição</span>
    </div>
  </div>
  
  <h2 style="color: #f59e0b; margin-bottom: 15px;">📊 Estatísticas do Período</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <span class="value">${stats.average}</span>
      <span class="label">Média</span>
    </div>
    <div class="stat-card">
      <span class="value">${stats.min}</span>
      <span class="label">Mínima</span>
    </div>
    <div class="stat-card">
      <span class="value">${stats.max}</span>
      <span class="label">Máxima</span>
    </div>
    <div class="stat-card">
      <span class="value">${stats.normalPercentage}%</span>
      <span class="label">Dentro do Normal</span>
    </div>
  </div>
  
  <h2 style="color: #f59e0b; margin-bottom: 15px;">📋 Histórico Detalhado</h2>
  <table>
    <thead>
      <tr>
        <th>Data/Hora</th>
        <th>Glicemia</th>
        <th>Status</th>
        <th>Insulina</th>
        <th>Recomendação</th>
      </tr>
    </thead>
    <tbody>
      ${readings.map(reading => {
        const statusClass = getStatusClass(reading.status);
        return `
        <tr>
          <td>${formatDate(reading.timestamp)}</td>
          <td class="glucose-value">${reading.value} mg/dL</td>
          <td><span class="status-badge ${statusClass}">${getStatusLabel(reading.status)}</span></td>
          <td class="insulin-dose">${reading.insulinUnits ? `${reading.insulinUnits} un` : '-'}</td>
          <td style="font-size: 12px;">${reading.recommendation}</td>
        </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p><strong>⚠️ Importante:</strong> Este relatório é apenas um guia. Sempre consulte seu médico para ajustes no tratamento.</p>
    <p style="margin-top: 10px;">Desenvolvido com 💛 pelo Beez - Seu guia de glicemia e insulina</p>
  </div>
</body>
</html>
  `;
}

function getStatusClass(status: string): string {
  if (status.includes('normal')) return 'status-normal';
  if (status.includes('low')) return 'status-low status-critical';
  if (status.includes('high')) return 'status-high';
  if (status.includes('critical')) return 'status-critical';
  return 'status-normal';
}

function calculateStats(readings: GlucoseReading[]) {
  const values = readings.map(r => r.value);
  const average = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const normalCount = readings.filter(r => r.status === 'normal').length;
  const normalPercentage = Math.round((normalCount / readings.length) * 100);
  
  return { average, min, max, normalPercentage };
}

export function printReport(readings: GlucoseReading[], patientName?: string) {
  const html = generatePrintableHTML(readings, patientName);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
      }, 250);
    };
  } else {
    alert('Por favor, permita pop-ups para imprimir o relatório.');
  }
}

export function exportToCSV(readings: GlucoseReading[], patientName?: string) {
  const headers = ['Data/Hora', 'Glicemia (mg/dL)', 'Status', 'Insulina (un)', 'Recomendação'];
  const rows = readings.map(reading => [
    formatDate(reading.timestamp),
    reading.value.toString(),
    getStatusLabel(reading.status),
    reading.insulinUnits?.toString() || '-',
    reading.recommendation.replace(/,/g, ';') // Replace commas in text to avoid CSV issues
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const fileName = `historico-glicemia-${patientName || 'paciente'}-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
