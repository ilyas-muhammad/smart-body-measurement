import React, { useState } from 'react';

const MeasurementInstructions = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Clothing guidelines
  const clothingGuidelines = {
    title: "👔 Panduan Pakaian untuk Pengukuran yang Akurat",
    icon: "📏",
    items: [
      {
        do: "Gunakan pakaian ketat atau pas badan",
        dont: "Hindari pakaian longgar, besar, atau oversize",
        reason: "Pakaian longgar dapat menambah 5-15cm pada pengukuran lebar"
      },
      {
        do: "Kenakan pakaian olahraga, legging, atau kaos ketat",
        dont: "Hindari jaket tebal, mantel, atau kemeja longgar",
        reason: "Pakaian tebal menutupi bentuk tubuh asli Anda"
      },
      {
        do: "Pilih pakaian yang kontras dengan latar belakang",
        dont: "Hindari pakaian yang warnanya sama dengan tembok",
        reason: "Kontras yang baik membantu AI mendeteksi garis tubuh Anda"
      },
      {
        do: "Lepas aksesori besar (jam, perhiasan, ikat pinggang)",
        dont: "Pakai aksesori yang dapat mengganggu deteksi",
        reason: "Aksesori dapat membingungkan algoritma deteksi landmark"
      },
      {
        do: "Ikat rambut atau jauhkan dari bahu",
        dont: "Biarkan rambut menutupi bahu atau landmark tubuh",
        reason: "Rambut dapat mengaburkan pengukuran bahu dan leher"
      }
    ]
  };

  // Measurement instructions for each body part
  const measurementInstructions = {
    topMeasurements: {
      title: "👔 Pengukuran Tubuh Bagian Atas",
      icon: "📐",
      measurements: [
        {
          name: "Lebar Bahu",
          english: "Shoulder Width",
          description: "Jarak dari ujung bahu kiri ke ujung bahu kanan",
          howToMeasure: [
            "Berdiri tegak dengan lengan di samping badan",
            "Temukan titik tulang di ujung setiap bahu",
            "Ukur lurus dari satu ujung bahu ke ujung lainnya",
            "Jaga meteran tetap sejajar dengan lantai"
          ],
          tips: [
            "Jangan membungkuk atau menarik bahu ke belakang secara tidak natural",
            "Ukur di bagian terlebar bahu Anda",
            "Biasanya 2-3cm di bawah persendian bahu yang sebenarnya"
          ],
          commonErrors: [
            "Mengukur di leher bukan di ujung bahu",
            "Menyertakan otot lengan dalam pengukuran",
            "Mengukur miring bukan lurus"
          ]
        },
        {
          name: "Lebar Pundak",
          english: "Shoulder Blade Width",
          description: "Jarak antara tulang belikat di punggung Anda",
          howToMeasure: [
            "Minta seseorang mengukur dari belakang",
            "Temukan tepi dalam tulang belikat Anda",
            "Ukur lurus dari satu belikat ke belikat lainnya",
            "Biarkan lengan rileks di samping badan"
          ],
          tips: [
            "Jangan merapatkan tulang belikat",
            "Pertahankan postur natural",
            "Pengukuran ini diambil di bagian terlebar punggung atas"
          ],
          commonErrors: [
            "Mengukur di ketinggian yang salah di punggung",
            "Merapatkan atau melebarkan tulang belikat secara tidak natural",
            "Keliru dengan lebar punggung total"
          ]
        },
        {
          name: "Lebar Dada",
          english: "Chest Width",
          description: "Lebar dada/payudara Anda di titik terlebar",
          howToMeasure: [
            "Berdiri tegak, lengan di samping badan",
            "Temukan bagian terlebar dada (biasanya setinggi puting)",
            "Ukur lurus dari samping ke samping",
            "Jangan sertakan lengan dalam pengukuran"
          ],
          tips: [
            "Bernapas normal, jangan kembungkan atau kempiskan dada",
            "Untuk wanita: ukur di bagian terpenuh payudara",
            "Untuk pria: ukur setinggi puting atau titik terlebar dada"
          ],
          commonErrors: [
            "Mengukur terlalu tinggi (di tulang selangka) atau terlalu rendah",
            "Menyertakan area lengan/ketiak dalam pengukuran",
            "Menahan napas saat mengukur"
          ]
        },
        {
          name: "Lebar Pinggang",
          english: "Waist Width",
          description: "Lebar pinggang di bagian tersempit",
          howToMeasure: [
            "Temukan garis pinggang natural (biasanya di atas pusar)",
            "Temukan bagian tersempit dari torso",
            "Ukur lurus dari samping ke samping",
            "Berdiri natural, jangan kempiskan perut"
          ],
          tips: [
            "Pinggang natural biasanya 5-8cm di atas tulang pinggul",
            "Jangan ukur di garis ikat pinggang kecuali itu pinggang natural Anda",
            "Bernapas normal saat pengukuran"
          ],
          commonErrors: [
            "Mengukur di tingkat pinggul bukan pinggang",
            "Mengukur di pusar untuk semua orang (pinggang bervariasi tiap orang)",
            "Kempiskan perut secara artifisial"
          ]
        },
        {
          name: "Panjang Punggung",
          english: "Back Length",
          description: "Panjang dari pangkal leher ke garis pinggang di punggung",
          howToMeasure: [
            "Temukan pangkal leher (di mana leher bertemu bahu)",
            "Temukan garis pinggang natural dari belakang",
            "Ukur lurus mengikuti tulang belakang",
            "Jaga kepala dalam posisi natural"
          ],
          tips: [
            "Ini penting untuk pas jaket dan kemeja",
            "Jangan miringkan kepala ke depan atau belakang",
            "Ukur mengikuti tengah punggung"
          ],
          commonErrors: [
            "Mulai terlalu tinggi (di garis rambut) atau terlalu rendah",
            "Mengukur miring bukan lurus ke bawah",
            "Tidak mengikuti lekukan natural tulang belakang"
          ]
        },
        {
          name: "Panjang Lengan",
          english: "Arm Length",
          description: "Panjang dari bahu ke pergelangan tangan dengan lengan terentang",
          howToMeasure: [
            "Rentangkan lengan lurus ke samping (pose T)",
            "Ukur dari ujung bahu ke tulang pergelangan tangan",
            "Jaga lengan sejajar dengan lantai",
            "Ukur sepanjang bagian luar lengan"
          ],
          tips: [
            "Jangan tekuk siku saat mengukur",
            "Ukur sampai tulang pergelangan tangan, bukan ujung jari",
            "Ini menentukan panjang lengan untuk pakaian berlengan panjang"
          ],
          commonErrors: [
            "Mengukur dengan siku tertekuk",
            "Mengukur sampai ujung jari bukan pergelangan tangan",
            "Tidak menjaga lengan tetap terentang penuh"
          ]
        },
        {
          name: "Panjang Tangan",
          english: "Sleeve Length",
          description: "Panjang lengan pakaian sebenarnya (lebih pendek dari panjang lengan penuh)",
          howToMeasure: [
            "Ini biasanya 95% dari panjang lengan penuh Anda",
            "Untuk kemeja: ukur sampai di mana Anda ingin manset berada",
            "Untuk pakaian kasual: biasanya sampai tulang pergelangan tangan",
            "Pertimbangkan bagaimana Anda suka lengan pas"
          ],
          tips: [
            "Lengan kemeja harus tampak 0.5cm melebihi manset jaket",
            "Lengan kasual biasanya berakhir di tulang pergelangan tangan",
            "Jenis pakaian berbeda memiliki panjang ideal berbeda"
          ],
          commonErrors: [
            "Menggunakan panjang lengan penuh bukan panjang lengan yang diinginkan",
            "Tidak mempertimbangkan perbedaan jenis pakaian",
            "Tidak memperhitungkan preferensi personal"
          ]
        }
      ]
    },
    bottomMeasurements: {
      title: "👖 Pengukuran Tubuh Bagian Bawah",
      icon: "📏",
      measurements: [
        {
          name: "Lebar Pinggul",
          english: "Hip Width",
          description: "Lebar pinggul di bagian terlebar",
          howToMeasure: [
            "Berdiri dengan kaki rapat",
            "Temukan bagian terlebar pinggul/bokong Anda",
            "Ukur lurus dari samping ke samping",
            "Biasanya 18-20cm di bawah pinggang natural"
          ],
          tips: [
            "Ini berbeda dari pengukuran pinggang",
            "Sertakan bagian terpenuh bokong",
            "Jaga berat badan terdistribusi merata di kedua kaki"
          ],
          commonErrors: [
            "Mengukur di tingkat pinggang bukan pinggul",
            "Tidak menyertakan bagian terpenuh bokong",
            "Mengukur terlalu tinggi atau rendah di torso"
          ]
        },
        {
          name: "Panjang Kaki",
          english: "Leg Length",
          description: "Panjang dari pinggul ke pergelangan kaki",
          howToMeasure: [
            "Berdiri tegak menempel dinding",
            "Ukur dari tulang pinggul ke tulang pergelangan kaki",
            "Jaga kaki lurus, jangan tekuk lutut",
            "Ukur sepanjang bagian luar kaki"
          ],
          tips: [
            "Ini menentukan panjang dalam celana",
            "Ukur sampai tulang pergelangan kaki, bukan ke lantai",
            "Jaga kedua kaki lurus dan sejajar"
          ],
          commonErrors: [
            "Mengukur dengan lutut tertekuk",
            "Mengukur ke lantai bukan ke pergelangan kaki",
            "Mulai terlalu tinggi atau rendah di pinggul"
          ]
        },
        {
          name: "Panjang Celana",
          english: "Pants Length",
          description: "Panjang celana yang diinginkan (biasanya lebih pendek dari panjang kaki penuh)",
          howToMeasure: [
            "Ini biasanya 92-95% dari panjang kaki Anda",
            "Untuk celana formal: sampai bagian atas tumit sepatu",
            "Untuk celana kasual: sampai tulang pergelangan kaki atau sedikit di bawah",
            "Pertimbangkan tinggi sepatu yang akan dipakai"
          ],
          tips: [
            "Celana formal harus memiliki sedikit lipatan di sepatu",
            "Celana kasual bisa berakhir di pergelangan kaki atau menampakkan sedikit pergelangan kaki",
            "Pertimbangkan preferensi panjang"
          ],
          commonErrors: [
            "Menggunakan panjang kaki penuh tanpa mempertimbangkan tinggi sepatu",
            "Tidak memperhitungkan gaya celana berbeda",
            "Mengabaikan preferensi gaya personal"
          ]
        }
      ]
    },
    circumferenceMeasurements: {
      title: "⭕ Pengukuran Lingkar",
      icon: "📐",
      measurements: [
        {
          name: "Lingkar Dada",
          english: "Chest Circumference",
          description: "Pengukuran penuh mengelilingi dada di titik terpenuh",
          howToMeasure: [
            "Lingkarkan meteran di sekitar dada di titik terpenuh",
            "Jaga meteran sejajar dengan lantai",
            "Jangan tarik meteran terlalu kencang, cukup pas dengan tubuh",
            "Bernapas normal, jangan kembungkan dada"
          ],
          tips: [
            "Untuk pria: ukur setinggi puting",
            "Untuk wanita: ukur di bagian terpenuh payudara",
            "Meteran harus pas tapi tidak menekan"
          ],
          commonErrors: [
            "Menarik meteran terlalu kencang",
            "Mengukur di ketinggian yang salah",
            "Menahan napas saat mengukur"
          ]
        },
        {
          name: "Lingkar Pinggang",
          english: "Waist Circumference",
          description: "Pengukuran penuh mengelilingi pinggang di bagian tersempit",
          howToMeasure: [
            "Temukan garis pinggang natural Anda",
            "Lingkarkan meteran di bagian tersempit torso",
            "Jaga meteran sejajar dengan lantai",
            "Jangan kempiskan perut"
          ],
          tips: [
            "Pinggang natural biasanya tepat di atas pusar",
            "Jangan ukur di garis ikat pinggang kecuali itu pinggang natural",
            "Berdiri natural, jangan manipulasi postur"
          ],
          commonErrors: [
            "Mengukur di tingkat pinggul",
            "Kempiskan perut",
            "Mengukur di garis ikat pinggang bukan pinggang natural"
          ]
        },
        {
          name: "Lingkar Pinggul",
          english: "Hip Circumference",
          description: "Pengukuran penuh mengelilingi pinggul di bagian terlebar",
          howToMeasure: [
            "Berdiri dengan kaki rapat",
            "Lingkarkan meteran di bagian terlebar pinggul/bokong",
            "Jaga meteran sejajar dengan lantai",
            "Sertakan bagian terpenuh bokong"
          ],
          tips: [
            "Biasanya 18-20cm di bawah pinggang natural",
            "Sertakan proyeksi terpenuh bokong",
            "Jangan tekan jaringan lunak"
          ],
          commonErrors: [
            "Mengukur terlalu tinggi (di pinggang)",
            "Tidak menyertakan bagian terpenuh bokong",
            "Menarik meteran terlalu kencang"
          ]
        },
        {
          name: "Lingkar Lengan Atas",
          english: "Bicep/Arm Circumference",
          description: "Lingkar lengan atas di bagian terbesarnya",
          howToMeasure: [
            "Kepalkan lengan untuk menemukan bagian terbesar bisep",
            "Rilekskan lengan dan biarkan menggantung natural",
            "Lingkarkan meteran di bagian terbesar lengan yang rileks",
            "Jaga meteran tegak lurus dengan panjang lengan"
          ],
          tips: [
            "Jangan kepalkan saat mengukur",
            "Temukan bagian terbesar dulu, lalu rilekskan",
            "Biasanya sekitar 1/3 ke bawah dari bahu"
          ],
          commonErrors: [
            "Tetap kepalkan lengan saat mengukur",
            "Mengukur di lokasi yang salah di lengan",
            "Menarik meteran terlalu kencang"
          ]
        },
        {
          name: "Lingkar Paha",
          english: "Thigh Circumference",
          description: "Lingkar paha di bagian terbesarnya",
          howToMeasure: [
            "Berdiri dengan berat badan terdistribusi merata",
            "Temukan bagian terbesar paha (biasanya tepat di bawah bokong)",
            "Lingkarkan meteran di bagian terbesar",
            "Jaga meteran tegak lurus dengan kaki"
          ],
          tips: [
            "Biasanya ukur sekitar 5-8cm di bawah selangkangan",
            "Jangan keraskan otot paha",
            "Jaga berat badan merata di kedua kaki"
          ],
          commonErrors: [
            "Mengukur terlalu rendah di paha",
            "Keraskan otot saat mengukur",
            "Tidak menemukan titik terbesar"
          ]
        },
        {
          name: "Lingkar Betis",
          english: "Calf Circumference",
          description: "Lingkar betis di bagian terbesarnya",
          howToMeasure: [
            "Berdiri natural dengan berat badan terdistribusi",
            "Temukan bagian terbesar otot betis",
            "Lingkarkan meteran di bagian terbesar",
            "Jaga meteran tegak lurus dengan kaki"
          ],
          tips: [
            "Biasanya sekitar setengah jalan antara lutut dan pergelangan kaki",
            "Jangan keraskan otot betis",
            "Ukur kedua kaki jika tidak simetris"
          ],
          commonErrors: [
            "Mengukur di ketinggian yang salah di kaki",
            "Keraskan otot saat mengukur",
            "Tidak menemukan titik terbesar yang sebenarnya"
          ]
        }
      ]
    }
  };

  const SectionHeader = ({ title, icon, isExpanded, onClick }) => (
    <div 
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        cursor: 'pointer',
        border: '1px solid #e9ecef',
        marginBottom: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h3 style={{ margin: 0, color: '#495057' }}>{title}</h3>
      </div>
      <span style={{ fontSize: '16px' }}>
        {isExpanded ? '▼' : '▶'}
      </span>
    </div>
  );

  const MeasurementCard = ({ measurement }) => (
    <div style={{
      padding: '16px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      marginBottom: '16px',
      backgroundColor: '#ffffff',
      color: '#0E0E0E'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 4px 0', color: '#212529' }}>
          {measurement.name}
        </h4>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d', fontStyle: 'italic' }}>
          {measurement.english}
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}>
          {measurement.description}
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#28a745' }}>📋 Cara Mengukur:</h5>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          {measurement.howToMeasure.map((step, index) => (
            <li key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#007bff' }}>💡 Tips:</h5>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {measurement.tips.map((tip, index) => (
            <li key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h5 style={{ margin: '0 0 8px 0', color: '#dc3545' }}>⚠️ Kesalahan Umum yang Harus Dihindari:</h5>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {measurement.commonErrors.map((error, index) => (
            <li key={index} style={{ marginBottom: '4px', fontSize: '14px' }}>
              {error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', color: '#FFFFFF', marginBottom: '24px' }}>
        📏 Panduan & Instruksi Pengukuran
      </h2>

      {/* Clothing Guidelines */}
      <div style={{ marginBottom: '32px' }}>
        <SectionHeader 
          title={clothingGuidelines.title}
          icon={clothingGuidelines.icon}
          isExpanded={expandedSections.clothing}
          onClick={() => toggleSection('clothing')}
        />
        
        {expandedSections.clothing && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{ margin: '0 0 16px 0', fontWeight: 'bold', color: '#856404' }}>
              ⚡ Panduan pakaian ini dapat meningkatkan akurasi pengukuran hingga 50-80%!
            </p>
            
            {clothingGuidelines.items.map((item, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                padding: '12px',
                backgroundColor: '#ffffff',
                color: '#0E0E0E',
                borderRadius: '6px',
                marginBottom: '8px',
                border: '1px solid #f8f9fa'
              }}>
                <div>
                  <strong style={{ color: '#28a745' }}>✅ LAKUKAN:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{item.do}</p>
                </div>
                <div>
                  <strong style={{ color: '#dc3545' }}>❌ JANGAN:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{item.dont}</p>
                </div>
                <div>
                  <strong style={{ color: '#6f42c1' }}>🤔 MENGAPA:</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Measurements */}
      <div style={{ marginBottom: '32px' }}>
        <SectionHeader 
          title={measurementInstructions.topMeasurements.title}
          icon={measurementInstructions.topMeasurements.icon}
          isExpanded={expandedSections.top}
          onClick={() => toggleSection('top')}
        />
        
        {expandedSections.top && (
          <div>
            {measurementInstructions.topMeasurements.measurements.map((measurement, index) => (
              <MeasurementCard key={index} measurement={measurement} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Measurements */}
      <div style={{ marginBottom: '32px' }}>
        <SectionHeader 
          title={measurementInstructions.bottomMeasurements.title}
          icon={measurementInstructions.bottomMeasurements.icon}
          isExpanded={expandedSections.bottom}
          onClick={() => toggleSection('bottom')}
        />
        
        {expandedSections.bottom && (
          <div>
            {measurementInstructions.bottomMeasurements.measurements.map((measurement, index) => (
              <MeasurementCard key={index} measurement={measurement} />
            ))}
          </div>
        )}
      </div>

      {/* Circumference Measurements */}
      <div style={{ marginBottom: '32px' }}>
        <SectionHeader 
          title={measurementInstructions.circumferenceMeasurements.title}
          icon={measurementInstructions.circumferenceMeasurements.icon}
          isExpanded={expandedSections.circumference}
          onClick={() => toggleSection('circumference')}
        />
        
        {expandedSections.circumference && (
          <div>
            {measurementInstructions.circumferenceMeasurements.measurements.map((measurement, index) => (
              <MeasurementCard key={index} measurement={measurement} />
            ))}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div style={{
        padding: '16px',
        backgroundColor: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        marginTop: '32px'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#0E0E0E' }}>🚀 Tips Cepat untuk Hasil Terbaik:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#0E0E0E' }}>
          <li style={{ marginBottom: '4px' }}>Kenakan pakaian ketat (paling penting!)</li>
          <li style={{ marginBottom: '4px' }}>Pastikan pencahayaan baik dan latar belakang jelas</li>
          <li style={{ marginBottom: '4px' }}>Berdiri natural - jangan berpose atau keraskan otot</li>
          <li style={{ marginBottom: '4px' }}>Jaga perangkat tetap stabil saat mengambil foto</li>
          <li style={{ marginBottom: '4px' }}>Ambil pengukuran di waktu yang sama setiap hari untuk konsistensi</li>
        </ul>
      </div>
    </div>
  );
};

export default MeasurementInstructions; 