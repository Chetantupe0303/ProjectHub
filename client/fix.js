const fs = require('fs');
const file = 'e:/ProjectHub/student-project-manager/client/src/pages/AdminDashboard.js';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/\\`/g, '`').replace(/\\\$/g, '$');
fs.writeFileSync(file, content);
console.log('Fixed syntax errors.');
