const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace font sizes
const sizeMap = {
  '9': '12',
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
  '20': '24',
  '22': '28',
  '26': '32',
};

// fontSize: 13.5 -> fontSize: 16
content = content.replace(/fontSize:\s*([\d.]+)/g, (match, p1) => {
  if (sizeMap[p1]) {
    return `fontSize: ${sizeMap[p1]}`;
  }
  return match;
});

// font sizes in strings like '15.5px'
content = content.replace(/fontSize:\s*'([\d.]+)px'/g, (match, p1) => {
  if (sizeMap[p1]) {
    return `fontSize: '${sizeMap[p1]}px'`;
  }
  return match;
});

// clamp fonts
content = content.replace(/clamp\(36px,\s*5\.5vw,\s*56px\)/g, 'clamp(42px, 6vw, 72px)');
content = content.replace(/clamp\(28px,\s*4vw,\s*36px\)/g, 'clamp(34px, 5vw, 48px)');
content = content.replace(/clamp\(26px,\s*4vw,\s*34px\)/g, 'clamp(32px, 5vw, 42px)');

// Icon sizes: size={16}
content = content.replace(/size=\{([\d.]+)\}/g, (match, p1) => {
  if (sizeMap[p1]) {
    return `size={${sizeMap[p1]}}`;
  }
  return match;
});

// Hardcoded width/height for icons/logos
// width: 32, height: 32
content = content.replace(/width:\s*32,\s*height:\s*32/g, 'width: 44, height: 44');
content = content.replace(/width:\s*38,\s*height:\s*38/g, 'width: 48, height: 48');
content = content.replace(/width:\s*44,\s*height:\s*44/g, 'width: 56, height: 56');
content = content.replace(/width:\s*56,\s*height:\s*56/g, 'width: 72, height: 72');

// max-width for containers
content = content.replace(/maxWidth:\s*1200/g, 'maxWidth: 1400');
content = content.replace(/maxWidth:\s*520/g, 'maxWidth: 640');

fs.writeFileSync('src/app/page.tsx', content);
console.log('Fixed sizes in page.tsx');
