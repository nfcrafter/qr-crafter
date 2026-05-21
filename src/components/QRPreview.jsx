import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

/**
 * Renders a preview of a QR code with the custom appearance saved in the QR record.
 * The component creates a QRCodeStyling instance and mounts it into a div.
 */
export default function QRPreview({ qr }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!qr) return;
    const app = qr.appearance || {};
    const qrCode = new QRCodeStyling({
      width: 80,
      height: 80,
      type: 'svg',
      data: `${window.location.origin}/r/${qr.slug}`,
      dotsOptions: {
        color: app.dotsColor || '#1A1265',
        type: app.dotsType || 'rounded',
      },
      backgroundOptions: {
        color: app.bgColor || '#EBEBDF',
      },
      cornersSquareOptions: {
        color: app.cornersColor || '#1A1265',
        type: app.cornersType || 'extra-rounded',
      },
      cornersDotOptions: {
        color: app.cornersDotColor || '#1A1265',
        type: app.cornersDotType || 'dot',
      },
    });
    // Clear previous content
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      qrCode.append(containerRef.current);
    }
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [qr]);

  return <div ref={containerRef} style={{ width: '80px', height: '80px' }} />;
}
