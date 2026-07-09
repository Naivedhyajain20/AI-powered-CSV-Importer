const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');

// 1. Update Navbar to use apple-glass-nav and new logo
pageContent = pageContent.replace(
  /<nav style={{[\s\S]*?borderBottom:[^\n]*\n\s*}}>/,
  `<nav className="apple-glass-nav" style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transition: 'all 0.3s ease'
          }}>`
);

pageContent = pageContent.replace(
  /<div style={{\n\s*width: 72, height: 72,[\s\S]*?color: '#fff'\n\s*}}>\n\s*G\n\s*<\/div>/,
  `<img src="/logo.png" alt="GrowEasy Logo" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} />`
);

pageContent = pageContent.replace(
  /padding: '16px 24px',/,
  `padding: '12px 24px',`
);

// Footer logo replacement
pageContent = pageContent.replace(
  /<div style={{\n\s*width: 44, height: 44,[\s\S]*?color: '#fff'\n\s*}}>\n\s*G\n\s*<\/div>/,
  `<img src="/logo.png" alt="GrowEasy Logo" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />`
);

// 2. Feature Cards
pageContent = pageContent.replace(
  /function FeatureCardLight\(\{ icon, title, desc, theme \}: \{ icon: React\.ReactNode; title: string; desc: string; theme: 'light' \| 'dark' \}\) {\n  return \(\n    <div style={{\n      background: theme === 'dark' \? 'rgba\\(15, 23, 42, 0\.5\\)' : '#fff',\n      padding: 32,\n      borderRadius: 16,\n      border: theme === 'dark' \? '1px solid rgba\\(255, 255, 255, 0\.08\\)' : '1px solid #e2e8f0',\n      textAlign: 'left',\n      boxShadow: theme === 'dark' \? 'none' : '0 4px 20px rgba\\(0,0,0,0\.02\\)',\n      transition: 'transform 0\.2s, boxShadow 0\.2s'\n    }} className="hover:shadow-md transition">/g,
  `function FeatureCardLight({ icon, title, desc, theme }: { icon: React.ReactNode; title: string; desc: string; theme: 'light' | 'dark' }) {
  return (
    <div style={{
      padding: 32,
      borderRadius: 16,
      textAlign: 'left',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }} className="apple-glass hover:shadow-md transition">`
);

// Wait, the previous replace failed because box-shadow was in kebab-case. Let's make it simpler.
pageContent = pageContent.replace(
  /className="hover:shadow-md transition"/g,
  `className="apple-glass hover:shadow-md transition"`
);

// 3. Benefits Cards
pageContent = pageContent.replace(
  /<div key=\{idx\} style=\{\{ textAlign: 'left', background: theme === 'dark' \? 'rgba\(15, 23, 42, 0\.5\)' : '#fff', padding: 24, borderRadius: 16, border: theme === 'dark' \? '1px solid rgba\(255, 255, 255, 0\.08\)' : '1px solid #e2e8f0' \}\}>/g,
  `<div key={idx} className="apple-glass" style={{ textAlign: 'left', padding: 24, borderRadius: 16 }}>`
);

// 4. Timeline Cards
pageContent = pageContent.replace(
  /<div key=\{idx\} style=\{\{\n\s*display: 'flex',\n\s*alignItems: 'center',\n\s*gap: 16,\n\s*background: theme === 'dark' \? 'rgba\(15, 23, 42, 0\.5\)' : '#f8fafc',\n\s*padding: 16,\n\s*borderRadius: 12,\n\s*border: theme === 'dark' \? '1px solid rgba\(255,255,255,0\.08\)' : '1px solid #e2e8f0',\n\s*textAlign: 'left'\n\s*\}\}>/g,
  `<div key={idx} className="apple-glass" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: 16,
                    borderRadius: 12,
                    textAlign: 'left'
                  }}>`
);

fs.writeFileSync('src/app/page.tsx', pageContent);

let sidebarContent = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
sidebarContent = sidebarContent.replace(
  /<div className="sidebar-logo-icon">G<\/div>/,
  `<img src="/logo.png" alt="GrowEasy Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />`
);
fs.writeFileSync('src/components/Sidebar.tsx', sidebarContent);

console.log('Applied apple-glass and new logo!');
