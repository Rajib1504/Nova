const fs = require('fs');
const path = 'node_modules/@corsair-dev/googlecalendar/dist/index.js';
let content = fs.readFileSync(path, 'utf8');

const regex = /eventType:[a-z]\.enum\(\["default","outOfOffice","focusTime","workingLocation"\]\)\.optional\(\)/g;

if (regex.test(content)) {
    content = content.replace(regex, (match) => {
        return match.split('.enum')[0] + '.string().optional()';
    });
    fs.writeFileSync(path, content);
    console.log("Successfully patched Zod enum validation using safe string replacement!");
} else {
    console.log("Could not find the target string to patch.");
}
