export interface ExportColumn {
  key: string;
  label: string;
}

interface ExportOptions {
  filename: string;
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  rows: Record<string, string | number>[];
  summaryCards?: { label: string; value: string }[];
}

function escapeHtml(val: unknown): string {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Downloads a styled Excel (.xls) workbook with UTF-8 BOM (keeps $ and ৳ crisp in Excel) */
export function exportTableToExcel({ filename, title, subtitle, columns, rows, summaryCards }: ExportOptions) {
  const today = new Date().toISOString().slice(0, 10);
  const summaryHtml = summaryCards?.length
    ? `<tr>${summaryCards
        .map((c) => `<td style="background:#f5f5f7;padding:6px 10px;border:1px solid #d4d4d8;"><b>${escapeHtml(c.label)}:</b> ${escapeHtml(c.value)}</td>`)
        .join('')}</tr><tr><td colspan="${columns.length}">&nbsp;</td></tr>`
    : '';

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="UTF-8" /></head>
      <body style="font-family:Arial,sans-serif;font-size:12px;">
        <table border="0" cellpadding="6" cellspacing="0">
          <tr><td colspan="${columns.length}" style="font-size:16px;font-weight:bold;">AYAAN CLOTHING — ${escapeHtml(title)}</td></tr>
          <tr><td colspan="${columns.length}" style="color:#555;">${escapeHtml(subtitle || `Generated on ${today} · Uttara, Dhaka, Bangladesh`)}</td></tr>
          <tr><td colspan="${columns.length}">&nbsp;</td></tr>
          ${summaryHtml}
        </table>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;border-color:#d4d4d8;">
          <thead>
            <tr style="background:#0a0b0e;color:#ffffff;font-weight:bold;">
              ${columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) =>
                  `<tr>${columns.map((c) => `<td>${escapeHtml(r[c.key] ?? '—')}</td>`).join('')}</tr>`
              )
              .join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${today}.xls`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Opens a crisp pure-white Ayaan Clothing letterhead report ready for 1-click Save as PDF */
export function exportTableToPdf({ title, subtitle, columns, rows, summaryCards }: Omit<ExportOptions, 'filename'>) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const win = window.open('', '_blank', 'width=1024,height=760');
  if (!win) {
    window.print();
    return;
  }

  const summaryHtml = summaryCards?.length
    ? `<div class="summary">${summaryCards
        .map((c) => `<div class="card"><span>${escapeHtml(c.label)}</span><strong>${escapeHtml(c.value)}</strong></div>`)
        .join('')}</div>`
    : '';

  win.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Ayaan Clothing — ${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0a0b0e; background: #fff; margin: 0; padding: 36px; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 22px; }
          .brand { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: #4f46e5; font-weight: 700; }
          h1 { margin: 4px 0 0; font-size: 24px; letter-spacing: -0.02em; }
          .meta { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.5; }
          .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 20px; }
          .card { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 12px; padding: 12px; }
          .card span { display: block; font-size: 10px; text-transform: uppercase; color: #6b7280; }
          .card strong { display: block; margin-top: 4px; font-size: 15px; font-family: ui-monospace, monospace; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f5f5f7; text-align: left; padding: 10px 12px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #515154; border-bottom: 1px solid #d4d4d8; }
          td { padding: 9px 12px; border-bottom: 1px solid #f0f0f2; vertical-align: top; }
          tr:nth-child(even) td { background: #fcfcfd; }
          .footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #6b7280; display: flex; justify-content: space-between; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">Ayaan Clothing · Dhaka, Bangladesh</div>
            <h1>${escapeHtml(title)}</h1>
            <div style="font-size:12px;color:#515154;margin-top:4px;">${escapeHtml(subtitle || `${rows.length} record(s) included`)}</div>
          </div>
          <div class="meta">
            <div>Generated: ${today}</div>
            <div>House #33, Road #12, Sector #11, Uttara</div>
            <div>export@ayaanclothing.com · BGMEA #1708</div>
          </div>
        </div>
        ${summaryHtml}
        <table>
          <thead><tr>${columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')}</tr></thead>
          <tbody>
            ${rows.map((r) => `<tr>${columns.map((c) => `<td>${escapeHtml(r[c.key] ?? '—')}</td>`).join('')}</tr>`).join('')}
          </tbody>
        </table>
        <div class="footer">
          <span>Ayaan Clothing Business ERP Report</span>
          <span>Rows Exported: ${rows.length}</span>
        </div>
        <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 250); };</script>
      </body>
    </html>
  `);
  win.document.close();
}
