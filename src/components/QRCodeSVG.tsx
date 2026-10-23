'use client';

import React, { useMemo } from 'react';
import { generateQRCodeMatrix } from '@/lib/qrCode';

interface QRCodeSVGProps {
  value: string;
  size?: number;
  bgColor?: string;
  fgColor?: string;
  includeMargin?: boolean;
  className?: string;
  title?: string;
}

export default function QRCodeSVG({
  value,
  size = 180,
  bgColor = '#FFFFFF',
  fgColor = '#0F172A',
  includeMargin = true,
  className = '',
  title = 'QR Code Verification',
}: QRCodeSVGProps) {
  const { matrixSize, pathData } = useMemo(() => {
    try {
      const { size: qrSize, modules } = generateQRCodeMatrix(value);
      const margin = includeMargin ? 4 : 0;
      const totalSize = qrSize + margin * 2;

      let d = '';
      for (let r = 0; r < qrSize; r++) {
        for (let c = 0; c < qrSize; c++) {
          if (modules[r][c]) {
            const x = c + margin;
            const y = r + margin;
            d += `M${x},${y}h1v1h-1z `;
          }
        }
      }

      return {
        matrixSize: totalSize,
        pathData: d,
      };
    } catch (err) {
      console.error('Failed to generate QR code SVG:', err);
      return { matrixSize: 25, pathData: '' };
    }
  }, [value, includeMargin]);

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox={`0 0 ${matrixSize} ${matrixSize}`}
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      shapeRendering="crispEdges"
    >
      <rect width={matrixSize} height={matrixSize} fill={bgColor} rx="2" />
      <path d={pathData} fill={fgColor} />
    </svg>
  );
}
