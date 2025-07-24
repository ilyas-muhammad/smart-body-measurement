import React from 'react';

export default function TabNavigation({ activeTab, setActiveTab }) {
  return (
    <div
      style={{
        display: 'flex',
        marginBottom: '24px',
        borderBottom: '2px solid #e9ecef',
      }}
    >
      <button
        onClick={() => setActiveTab('measure')}
        style={{
          padding: '12px 24px',
          backgroundColor: activeTab === 'measure' ? '#007bff' : 'transparent',
          color: activeTab === 'measure' ? 'white' : '#007bff',
          border: 'none',
          borderBottom:
            activeTab === 'measure'
              ? '2px solid #007bff'
              : '2px solid transparent',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: activeTab === 'measure' ? 'bold' : 'normal',
        }}
      >
        📏 Ambil Pengukuran
      </button>
      <button
        onClick={() => setActiveTab('instructions')}
        style={{
          padding: '12px 24px',
          backgroundColor: activeTab === 'instructions' ? '#28a745' : 'transparent',
          color: activeTab === 'instructions' ? 'white' : '#28a745',
          border: 'none',
          borderBottom:
            activeTab === 'instructions'
              ? '2px solid #28a745'
              : '2px solid transparent',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: activeTab === 'instructions' ? 'bold' : 'normal',
        }}
      >
        📋 Panduan Pengukuran
      </button>
    </div>
  );
} 