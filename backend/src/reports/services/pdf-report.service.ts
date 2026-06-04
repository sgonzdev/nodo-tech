import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { CampaignRow, CoreMetrics } from '../types/reports.types';

const COLORS = {
  bg: '#0d1117',
  panel: '#161b26',
  text: '#e9eef7',
  dim: '#9aa6c2',
  green: '#38d088',
  blue: '#5b9dff',
  amber: '#f5b13d',
  alert: '#ff6a6a',
  line: '#2a3242',
};

const cop = (n: number) =>
  '$ ' + Math.round(n).toLocaleString('es-CO');
const roas = (n: number) => `${n.toFixed(2)}x`;
const pct = (n: number) => `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;

interface ReportInput {
  metrics: CoreMetrics;
  campaigns: CampaignRow[];
  model: string;
  windowDays: number;
}

@Injectable()
export class PdfReportService {
  generate(input: ReportInput): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));

    const done = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    this.paintBackground(doc);
    this.header(doc, input);
    this.metrics(doc, input.metrics);
    this.revenueChart(doc, input.campaigns);
    this.table(doc, input.campaigns);

    doc.end();
    return done;
  }

  private paintBackground(doc: PDFKit.PDFDocument) {
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(COLORS.bg);
  }

  private header(doc: PDFKit.PDFDocument, input: ReportInput) {
    doc.rect(40, 36, 8, 24).fill(COLORS.green);
    doc
      .fillColor(COLORS.text)
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('NodoTech · Análisis de Marketing', 58, 38);
    doc
      .fillColor(COLORS.dim)
      .fontSize(10)
      .font('Helvetica')
      .text(
        `Reconciliación ROAS real vs plataforma · modelo ${input.model} · ventana ${input.windowDays}d`,
        58,
        62,
      );
    doc
      .moveTo(40, 84)
      .lineTo(doc.page.width - 40, 84)
      .strokeColor(COLORS.line)
      .stroke();
  }

  private metrics(doc: PDFKit.PDFDocument, m: CoreMetrics) {
    const cards = [
      { label: 'Ingreso real (POS)', value: cop(m.realRevenue), color: COLORS.text },
      { label: 'Inversión total', value: cop(m.totalSpend), color: COLORS.text },
      {
        label: 'ROAS real',
        value: roas(m.realRoas),
        color: m.realRoas >= 1 ? COLORS.green : COLORS.alert,
      },
      { label: 'ROAS plataforma', value: roas(m.platformRoas), color: COLORS.blue },
      { label: 'Conversiones', value: String(m.conversions), color: COLORS.text },
      { label: 'Ticket promedio', value: cop(m.averageTicket), color: COLORS.text },
    ];
    const w = (doc.page.width - 80 - 2 * 12) / 3;
    cards.forEach((c, i) => {
      const x = 40 + (i % 3) * (w + 12);
      const y = 100 + Math.floor(i / 3) * 66;
      doc.roundedRect(x, y, w, 56, 8).fill(COLORS.panel);
      doc.fillColor(COLORS.dim).fontSize(8).font('Helvetica').text(c.label.toUpperCase(), x + 12, y + 10);
      doc.fillColor(c.color).fontSize(17).font('Helvetica-Bold').text(c.value, x + 12, y + 24);
    });
  }

  private revenueChart(doc: PDFKit.PDFDocument, rows: CampaignRow[]) {
    let y = 250;
    doc.fillColor(COLORS.text).fontSize(13).font('Helvetica-Bold').text('Ingreso atribuido por campaña', 40, y);
    y += 24;
    const max = Math.max(1, ...rows.map((r) => r.attributedRevenue));
    const barX = 200;
    const barW = doc.page.width - 40 - barX - 90;
    rows.forEach((r) => {
      doc.fillColor(COLORS.dim).fontSize(9).font('Helvetica').text(r.name, 40, y + 4, { width: 150, ellipsis: true });
      doc.roundedRect(barX, y, barW, 16, 4).fill(COLORS.panel);
      const fillW = Math.max(2, (r.attributedRevenue / max) * barW);
      doc.roundedRect(barX, y, fillW, 16, 4).fill(COLORS.green);
      doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Bold').text(cop(r.attributedRevenue), barX + barW + 8, y + 4, { width: 82 });
      y += 24;
    });
  }

  private table(doc: PDFKit.PDFDocument, rows: CampaignRow[]) {
    let y = 250 + 24 + rows.length * 24 + 30;
    doc.fillColor(COLORS.text).fontSize(13).font('Helvetica-Bold').text('Reconciliación por campaña', 40, y);
    y += 22;
    const cols = [
      { t: 'Campaña', x: 40, w: 130 },
      { t: 'Inversión', x: 175, w: 80 },
      { t: 'Atribuido', x: 260, w: 80 },
      { t: 'ROAS real', x: 345, w: 60 },
      { t: 'ROAS píxel', x: 410, w: 60 },
      { t: 'Dif %', x: 475, w: 70 },
    ];
    doc.fillColor(COLORS.dim).fontSize(8).font('Helvetica-Bold');
    cols.forEach((c) => doc.text(c.t.toUpperCase(), c.x, y, { width: c.w }));
    y += 16;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y).strokeColor(COLORS.line).stroke();
    y += 6;

    rows.forEach((r) => {
      if (r.flagged) {
        doc.rect(38, y - 2, doc.page.width - 76, 20).fillOpacity(0.08).fill(COLORS.amber).fillOpacity(1);
      }
      doc.fillColor(COLORS.text).fontSize(9).font('Helvetica').text(r.name, cols[0].x, y + 3, { width: cols[0].w, ellipsis: true });
      doc.fillColor(COLORS.dim).text(cop(r.adSpend), cols[1].x, y + 3, { width: cols[1].w });
      doc.fillColor(COLORS.text).text(cop(r.attributedRevenue), cols[2].x, y + 3, { width: cols[2].w });
      doc.fillColor(r.realRoas >= 1 ? COLORS.green : COLORS.alert).font('Helvetica-Bold').text(roas(r.realRoas), cols[3].x, y + 3, { width: cols[3].w });
      doc.fillColor(COLORS.blue).text(roas(r.platformRoas), cols[4].x, y + 3, { width: cols[4].w });
      doc.fillColor(r.flagged ? COLORS.amber : COLORS.dim).text(pct(r.reconciliationDiffPct), cols[5].x, y + 3, { width: cols[5].w });
      y += 22;
    });
  }
}
