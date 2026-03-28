const { existsSync } = require('fs');
const { join } = require('path');

const candidates = [
    join(__dirname, 'native', 'napi_test.node'),
    join(__dirname, 'napi_test.node'),
];

for (const p of candidates) {
    if (existsSync(p)) {
        module.exports = require(p);
        break;
    }
}

if (!module.exports) {
    throw new Error(
        `Native module not found. Run \`npm run build:native\` first.\nSearched: ${candidates.join(', ')}`
    );
}
