const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// For FeatureCardLight
pageContent = pageContent.replace(
  /background: theme === 'dark' \? 'rgba\(15, 23, 42, 0\.5\)' : '#fff',\s*/g,
  ''
);
pageContent = pageContent.replace(
  /border: theme === 'dark' \? '1px solid rgba\(255, 255, 255, 0\.08\)' : '1px solid #e2e8f0',\s*/g,
  ''
);
pageContent = pageContent.replace(
  /boxShadow: theme === 'dark' \? 'none' : '0 4px 20px rgba\(0,0,0,0\.02\)',\s*/g,
  ''
);

fs.writeFileSync('src/app/page.tsx', pageContent);

console.log('Cleaned inline styles');
