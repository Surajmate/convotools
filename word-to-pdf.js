// script.js
document.getElementById('convertButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please upload a Word document.');
        return;
    }

    const arrayBuffer = await file.arrayBuffer();

    try {
        // Extract the text and styles
        const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer });

        // Create a new PDF document
        const pdfDoc = await PDFLib.PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        // Simple text rendering from HTML
        const text = html.replace(/<[^>]+>/g, ''); // Remove HTML tags for basic text

        // Add text to the PDF (basic example)
        page.drawText(text, {
            x: 50,
            y: page.getHeight() - 50,
            size: 12,
            lineHeight: 14,
        });

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = url;
        downloadLink.download = 'converted.pdf';
        downloadLink.style.display = 'block';
        downloadLink.innerText = 'Download PDF';
    } catch (error) {
        alert('Error converting document: ' + error.message);
    }
});
