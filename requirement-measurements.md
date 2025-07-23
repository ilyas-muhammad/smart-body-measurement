```typescript
const topMeasurements = [
  "Chest Circumference",
  "Waist Circumference",
  "Hip Circumference",
  "Chest Width",
  "Shoulder Width",
  "Back Length",
  "Shoulder Blade Width",
  "Sleeve Length",
  "Bicep Circumference",
  "Neck Circumference"
];

const bottomMeasurements = [
  "Waist Circumference",
  "Pants Length",
  "Rise",
  "Thigh Circumference",
  "Calf Circumference"
];

// mapping
const topMeasurements = [
  { id: "chest", idn: "Lingkar Dada", eng: "Chest Circumference" },
  { id: "waist", idn: "Lingkar Perut", eng: "Waist Circumference" },
  { id: "hip", idn: "Lingkar Pinggul", eng: "Hip Circumference" },
  { id: "chestWidth", idn: "Lebar Dada", eng: "Chest Width" },
  { id: "shoulderWidth", idn: "Lebar Bahu", eng: "Shoulder Width" },
  { id: "backLength", idn: "Punggung", eng: "Back Length" },
  { id: "shoulderBladeWidth", idn: "Lebar Pundak", eng: "Shoulder Blade Width" },
  { id: "sleeveLength", idn: "Panjang Tangan", eng: "Sleeve Length" },
  { id: "bicep", idn: "Bisep", eng: "Bicep Circumference" },
  { id: "neck", idn: "Lingkar Leher", eng: "Neck Circumference" }
];

const bottomMeasurements = [
  { id: "waist", idn: "Lingkar Pinggang", eng: "Waist Circumference" },
  { id: "pantsLength", idn: "Panjang Celana", eng: "Pants Length" },
  { id: "rise", idn: "Pesak", eng: "Rise" }, // TOC (Total of Crotch)
  { id: "thigh", idn: "Lingkar Paha", eng: "Thigh Circumference" },
  { id: "calf", idn: "Lingkar Betis", eng: "Calf Circumference" }
];
```