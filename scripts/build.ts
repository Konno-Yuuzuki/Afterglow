import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import generate from './generate';

console.time();

const THEME_DIR = path.join(__dirname, '..', 'theme');
const DRACULA_PATH = path.join(__dirname, '../src/dracula.yml');

if (!existsSync(THEME_DIR)) {
    mkdirSync(THEME_DIR);
}

module.exports = async () => {
    const json = await generate(DRACULA_PATH);

    writeFileSync(
        path.join(THEME_DIR, 'Afterglow.json'),
        JSON.stringify(json, null, 4),
    );
};

if (require.main === module) {
    module.exports();
}


