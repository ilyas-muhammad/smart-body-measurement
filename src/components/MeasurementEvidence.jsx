import React, { useRef, useEffect } from 'react';

const SHOULDER_COLOR = 'lime';

export default function MeasurementEvidence({ imageSrc, landmarks, valueCm, valuePx, label }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!landmarks || !landmarks[11] || !landmarks[12] || !imageSrc) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // Draw shoulder points
      [11, 12].forEach(idx => {
        ctx.beginPath();
        ctx.arc(landmarks[idx].x * canvas.width, landmarks[idx].y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      });
      // Draw line between shoulders
      ctx.beginPath();
      ctx.moveTo(landmarks[11].x * canvas.width, landmarks[11].y * canvas.height);
      ctx.lineTo(landmarks[12].x * canvas.width, landmarks[12].y * canvas.height);
      ctx.strokeStyle = SHOULDER_COLOR;
      ctx.lineWidth = 4;
      ctx.stroke();
      // Draw value label in the middle
      const midX = ((landmarks[11].x + landmarks[12].x) / 2) * canvas.width;
      const midY = ((landmarks[11].y + landmarks[12].y) / 2) * canvas.height - 10;
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = SHOULDER_COLOR;
      ctx.textAlign = 'center';
      ctx.fillText(`${valueCm} cm / ${valuePx} px`, midX, midY);
    };
  }, [imageSrc, landmarks, valueCm, valuePx]);

  return (
    <div style={{ textAlign: 'center', margin: '8px 0' }}>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{label || 'Front View'}</div>
      <canvas ref={canvasRef} width={180} height={220} style={{ borderRadius: 8, border: '1px solid #ccc', background: '#fff' }} />
      <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
        <span style={{ color: SHOULDER_COLOR }}>■</span> Shoulder Width: red dots = landmarks, line = measured distance
      </div>
    </div>
  );
} 