import { downloadSVG } from './downloadSVG';

// function to download a QR code SVG element as a PNG file
export const downloadQR = (
  qrCodeElement,
  fileNamePrefix = 'qr-code'
) => {
  return downloadSVG(
    qrCodeElement,
    `${fileNamePrefix}-${Date.now()}.png`,
    300,
    300
  );
};