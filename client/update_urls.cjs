const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');
const fallback = 'import.meta.env.VITE_API_URL || "http://localhost:5000"';

fs.readdirSync(directoryPath).forEach(file => {
    if (file.endsWith('.jsx')) {
        let filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Template literals: `http://localhost:5000/api/...`
        content = content.replace(/`http:\/\/localhost:5000(\/api\/[^`]+)`/g, '`${' + fallback + '}$1`');
        
        // Single quotes: 'http://localhost:5000/api/...'
        content = content.replace(/'http:\/\/localhost:5000(\/api\/[^']+)'/g, '`${' + fallback + '}$1`');
        
        // Double quotes: "http://localhost:5000/api/..."
        content = content.replace(/"http:\/\/localhost:5000(\/api\/[^"]+)"/g, '`${' + fallback + '}$1`');
        
        fs.writeFileSync(filePath, content);
    }
});

console.log("URLs updated successfully.");
