// gerar-pdf-ch.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  try {
    // --- Ajuste o nome do arquivo HTML se necessário ---
    const htmlFile = path.resolve(__dirname, 'index-zh.html');


    // Verifica existência do arquivo (ajuda a diagnosticar erros)
    if (!fs.existsSync(htmlFile)) {
      throw new Error(`Arquivo HTML não encontrado: ${htmlFile}\nRenomeie seu .txt para .html e coloque na mesma pasta do script.`);
    }

    // Use file:// para arquivo local ou troque pela URL http se estiver usando servidor local
    const fileUrl = `file://${htmlFile}`;

    // Lança o Chromium/Chrome (adicione args em ambientes Linux sem suporte a sandbox)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // mantenha se estiver em Linux/CI
      // Se o Chromium não for baixado, especifique executablePath: '/usr/bin/google-chrome-stable'
    });

    const page = await browser.newPage();

    // Opcional: aumentar viewport se quiser (não obrigatório para PDF)
    await page.setViewport({ width: 1200, height: 800 });

    // Carrega o HTML e espera recursos terminarem (fonts/imagens)
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });

    // Force aplicação das regras @media print do CSS
    await page.emulateMediaType('print');

    // Pequena espera extra para garantir carregamento de fontes remotas (ajuste se necessário)
    await new Promise(resolve => setTimeout(resolve, 500));


    // Opcional: gera screenshot de debug (apenas para ver como ficou antes do PDF)
    // await page.screenshot({ path: 'debug-print.png', fullPage: true });

    // Gera o PDF
    await page.pdf({
      path: 'Jornal da Aplicação-XCMG-ch.pdf',      // saída
      printBackground: true,        // imprimir fundos (cores/gradientes)
      format: 'A4',                 // tamanho A4
      margin: {                     // margens (mesma que no CSS recomendado)
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      },
      preferCSSPageSize: true,      // respeita @page { size: ... } do seu CSS quando presente
      scale: 1                      // escala do render (padrão 1)
    });

    await browser.close();
    console.log('✅ PDF gerado com sucesso: Jornal-XCMG-Ch.pdf');
  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err);
    process.exit(1);
  }
})();
