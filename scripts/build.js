'use strict'

console.time()
const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'theme');
const DRACULA_PATH = path.join(__dirname, '../src/dracula.yml')

if (!fs.existsSync(THEME_DIR)) {
  fs.mkdirSync(THEME_DIR);
}

module.exports = async () => {


  const json = await generate(DRACULA_PATH);

  fs.writeFileSync(
    path.join(THEME_DIR, 'Afterglow.json'),
    JSON.stringify(json, null, 4)
  )

};

if (require.main === module) {
  module.exports();
}


