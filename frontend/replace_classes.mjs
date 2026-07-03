import fs from 'fs';
import path from 'path';

const files = [
  'Users.jsx',
  'Guests.jsx',
  'OCRRegister.jsx',
  'Services.jsx',
  'Purchases.jsx',
  'Sales.jsx',
  'Reports.jsx'
];

const dir = 'c:/Users/Usuario/Desktop/hostal-la-torre-ocr/hostal-la-torre-ocr/frontend/src/pages';

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace container cards
  content = content.replace(/className="bg-white border rounded-2/g, 'className="al-card');
  
  // Replace inputs and selects
  content = content.replace(/className="form-control"/g, 'className="al-input"');
  content = content.replace(/className="form-select"/g, 'className="al-input"');
  
  // Replace buttons
  content = content.replace(/className="btn btn-primary"/g, 'className="al-btn al-btn-primary"');
  content = content.replace(/className="btn btn-outline-secondary"/g, 'className="al-btn al-btn-outline"');
  content = content.replace(/className="btn btn-sm btn-outline-primary"/g, 'className="al-btn-sm al-btn-outline-primary"');
  content = content.replace(/className="btn btn-sm btn-outline-danger"/g, 'className="al-btn-sm al-btn-outline-danger"');
  
  // Replace tables
  content = content.replace(/className="table align-middle mb-0"/g, 'className="al-table"');
  content = content.replace(/className="table-responsive"/g, 'className="al-table-responsive"');

  // Replace badges
  content = content.replace(/className="badge text-bg-primary/g, 'className="al-badge al-badge-primary');
  content = content.replace(/className="badge text-bg-success"/g, 'className="al-badge al-badge-success"');
  content = content.replace(/className="badge text-bg-secondary"/g, 'className="al-badge al-badge-secondary"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
