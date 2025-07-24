import React from 'react';
import MeasurementCard from './MeasurementCard';

export default function MeasurementGroup({ title, measurements }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ color: '#2563eb', borderBottom: '2px solid #2563eb', paddingBottom: 8 }}>{title}</h3>
      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        {measurements.map((m, i) => (
          <MeasurementCard key={i} labelIdn={m.labelIdn} labelEng={m.labelEng} data={m.data}>
            {m.evidence}
          </MeasurementCard>
        ))}
      </div>
    </div>
  );
} 