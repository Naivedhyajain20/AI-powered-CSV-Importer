const fs = require('fs');

const files = [
  'src/components/Sidebar.tsx',
  'src/components/ImportModal.tsx',
  'src/components/LeadsTable.tsx',
  'src/app/globals.css'
];

const sizeMap = {
  '8.5': '11',
  '9': '12',
  '10': '13',
  '10.5': '13',
  '11': '14',
  '11.5': '14',
  '12': '15',
  '12.5': '15',
  '13': '16',
  '13.5': '16',
  '14': '18',
  '14.5': '18',
  '15': '18',
  '15.5': '18',
  '16': '20',
  '18': '22',
  '20': '24',
  '22': '28',
  '26': '32',
};

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  if (file.endsWith('.tsx')) {
    // Replace fontSize: 12
    content = content.replace(/fontSize:\s*([\d.]+)/g, (match, p1) => {
      if (sizeMap[p1]) return `fontSize: ${sizeMap[p1]}`;
      return match;
    });
    // Replace fontSize: '12px'
    content = content.replace(/fontSize:\s*'([\d.]+)px'/g, (match, p1) => {
      if (sizeMap[p1]) return `fontSize: '${sizeMap[p1]}px'`;
      return match;
    });
    // Replace size={12}
    content = content.replace(/size=\{([\d.]+)\}/g, (match, p1) => {
      if (sizeMap[p1]) return `size={${sizeMap[p1]}}`;
      return match;
    });
    // Replace specific widths/heights
    content = content.replace(/width:\s*32,\s*height:\s*32/g, 'width: 44, height: 44');
    content = content.replace(/width:\s*34,\s*height:\s*34/g, 'width: 46, height: 46');
    content = content.replace(/width:\s*38,\s*height:\s*38/g, 'width: 48, height: 48');
    content = content.replace(/width:\s*44,\s*height:\s*44/g, 'width: 56, height: 56');
    content = content.replace(/width:\s*56,\s*height:\s*56/g, 'width: 72, height: 72');
  } else if (file.endsWith('.css')) {
    // Replace font-size: 12px;
    content = content.replace(/font-size:\s*([\d.]+)px/g, (match, p1) => {
      if (sizeMap[p1]) return `font-size: ${sizeMap[p1]}px`;
      return match;
    });
    // sidebar-w
    content = content.replace(/--sidebar-w:\s*240px;/, '--sidebar-w: 280px;');
  }

  fs.writeFileSync(file, content);
  console.log(`Fixed sizes in ${file}`);
});
