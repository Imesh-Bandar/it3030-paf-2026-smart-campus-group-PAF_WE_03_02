import { useEffect, useState } from 'react';
import { toDataURL } from 'qrcode';

type BookingQrCodeProps = {
  token: string;
  bookingId: string;
  resourceName: string;
};

export function BookingQrCode({ token, bookingId, resourceName }: BookingQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    let active = true;

    toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 220,
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (active) {
          setQrDataUrl('');
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="booking-qr-panel">
      <div>
        <p className="booking-qr-label">QR check-in code</p>
        <p className="booking-qr-help">Scan this code at check-in for {resourceName}.</p>
      </div>
      {qrDataUrl ? (
        <img
          className="booking-qr-image"
          src={qrDataUrl}
          alt={`QR check-in code for booking ${bookingId}`}
        />
      ) : (
        <div className="booking-qr-placeholder">Generating QR code...</div>
      )}
      <details className="booking-qr-token-details">
        <summary>Show token</summary>
        <code className="booking-qr-token">{token}</code>
      </details>
    </div>
  );
}
