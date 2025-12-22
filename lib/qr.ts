// src/lib/qr.ts (version avancée)

import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas'; // pour logo

// Si tu n'as pas `canvas`, installe-le :
// npm install canvas
// (⚠️ Optionnel — si pas installé, on fallback sur QR simple)

export async function generateQRBase64(text: string, options: {
  size?: number;
  color?: string;
  logoUrl?: string; // ex: '/logo-small.png'
} = {}): Promise<string> {
  const { size = 300, color = '#2563eb', logoUrl } = options;

  try {
    // Si `canvas` est disponible (et logo demandé), on fait du QR pro
    if (logoUrl && typeof createCanvas === 'function') {
      return await generateQRWithLogo(text, size, color, logoUrl);
    } else {
      // Sinon, QR standard
      return await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: color,
          light: '#ffffff',
        },
      });
    }
  } catch (err) {
    console.warn('Fallback to basic QR (canvas not available)', err);
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: color,
        light: '#ffffff',
      },
    });
  }
}

async function generateQRWithLogo(text: string, size: number, color: string, logoUrl: string) {
  // 1. Génère le QR sans logo
  const qrBuffer = await QRCode.toBuffer(text, {
    width: size,
    margin: 2,
    color: {
      dark: color,
      light: '#ffffff',
    },
  });

  // 2. Crée un canvas
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // 3. Dessine le QR
  const qrImage = await loadImage(qrBuffer);
  ctx.drawImage(qrImage, 0, 0, size, size);

  // 4. Dessine le logo au centre (20% de la taille)
  const logoSize = Math.floor(size * 0.2);
  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;

  try {
    const logo = await loadImage(logoUrl);
    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  } catch (err) {
    console.warn('Logo non trouvé, ignoré', logoUrl);
  }

  // 5. Exporte en base64
  return canvas.toDataURL('image/jpeg');
}