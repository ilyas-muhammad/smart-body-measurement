import React from 'react';

export default function MeasurementCard({ labelIdn, labelEng, data, children }) {
  if (!data) return null;
  const confidenceColor = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  }[data.confidenceLabel] || '#6b7280';
  const confidenceIcon = {
    high: '✅',
    medium: '⚠️',
    low: '❌',
  }[data.confidenceLabel] || '❓';
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 12,
          backgroundColor: '#0E0E0E',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ fontWeight: '500', color: '#FFFFFF' }}>
          <div>{labelIdn}</div>
          <div style={{ fontSize: 11, fontStyle: 'italic', opacity: 0.7, fontWeight: 'normal' }}>{labelEng}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' }}>{data.value} {data.unit || 'cm'}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, color: confidenceColor, display: 'flex', alignItems: 'center', gap: 4 }}>
              {confidenceIcon} {data.confidenceLabel} ({data.confidencePercentage || 'N/A'}%)
            </span>
          </div>
        </div>
      </div>
      {children && <div style={{ marginTop: 8 }}>{children}</div>}
    </div>
  );
} 