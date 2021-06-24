'use strict';
const loadJSON = require('./yaml');
const chroma = require('chroma-js');
const fs = require('fs');
const { join } = require('path');

/**
 * On dev mode, sometimes when we read the file the return value of readFile
 * is an empty string. In those cases we need to read the file again
 */
async function readFileRetrying(filePathYAML) {
  const yaml = await fs.readFileSync(filePathYAML, 'utf8');
  if (!yaml) {
    return readFileRetrying(filePathYAML);
  }
  return yaml;
}

/**
 * 读取yaml配置
 */
async function loadTheme(filePathYAML) {
  const yaml = await readFileRetrying(filePathYAML);
  const json = await loadJSON(yaml);

  const light = await loadJSON(generate(yaml, json))

  for (let key in light.colors) {
    if (!light.colors[key]) {
      delete light.colors[key];
    }
  }
  return light
}

function generate(yaml, json) {

  const BG = json.dracula.base[0];
  const FG = json.dracula.base[1];
  // const otherBG = json.dracula.other.slice(3, 7);
  const otherBG = json.dracula.other
  const anyBG = [BG, ...otherBG];

  // Darken colors until constrast ratio complies with WCAG https://vis4.net/chromajs/#chroma-contrast
  // Minimum (Level AA) 4.5
  // Enhanced (Level AAA) 7

  const ratioTarget = 4.5
  const variantBG = FG
  const resolution = 0.001; // lower = more accurate, but longer execution

  const regex = /#[0-9A-F]{3,}/gi; // https://regexr.com/4cue7

  let yamlVariant = yaml.replace(regex, (color) => {
    const originalColor = color;
    const originalContrast = chroma.contrast(color, BG);

    function preserveOriginalContrast() {
      while (chroma.contrast(color, variantBG) > originalContrast) {
        color = chroma(color).brighten(resolution);
      }
      return color;
    }

    function getDarker() {
      while (chroma.contrast(color, variantBG) < ratioTarget) {
        color = chroma(color).darken(resolution);
      }
      return color;
    }

    // Replace Dracula Foreground w/ Background (#F8F8F2 -> #282A36)
    if (color === FG) {
      return BG;
    }

    if (anyBG.includes(color)) {
      return FG;
    }

    if (originalContrast < 4.5) {
      return preserveOriginalContrast();
    }

    return getDarker()
  });

  return yamlVariant.replace(
    'Dracula',
    `Dracula Light Theme`
  );
}

module.exports = loadTheme;
