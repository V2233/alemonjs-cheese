import QRCode from 'qrcode'
import { writeFileSync } from 'fs';

export function getQRCode(data: string, outputPath = '',options?):Promise<string> {
    return new Promise((resolve) => {
        QRCode.toDataURL(data, { type: 'png', ...options }, (err, url) => {
            if (err) throw err;
            if(outputPath) {
                const dataUrl = url.replace(/^data:image\/png;base64,/, "");
                const buffer = Buffer.from(dataUrl, 'base64');
                writeFileSync(outputPath, buffer);
            } else {
                resolve(url)
            }

        });

    })
}