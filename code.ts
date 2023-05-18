type colorType = {
  color: string;
  name: string;
  slug: string;
};

figma.showUI(__html__);
figma.ui.resize(500, 400);

// 現在のファイルの塗りのスタイルを取得
const styles = figma.getLocalPaintStyles();

// 255に換算
const to255 = (rgb: number) => {
  return Math.round(rgb * 255);
};

// RGBA換算
const toRgba = (rgb: RGB, opacity: number) => {
  return (
    to255(rgb.r) +
    "," +
    to255(rgb.g) +
    "," +
    to255(rgb.b) +
    "," +
    opacity.toFixed(1)
  );
};

// toCamelCase
const camelize = (str: string) => {
  const wordsArr = str.split(/[\W-_]/g);
  const camelizedWords = wordsArr
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
  return camelizedWords;
};

// toSnakeCase
const snakeCase = (str: string) => {
  const camelizedWords = camelize(str);
  return camelizedWords.replace(/[A-Z]/g, (c) => { return '_' + c.toLowerCase() }).slice(1);
};

if (figma.editorType === "figma") {

  const colors = styles.map((style) => {
    if (style.paints[0].type !== "SOLID") {
      // 単色でなければスキップ
      return;
    }
    
    const color = style.paints[0].color;
    const slug = snakeCase(style.name);
    const name = snakeCase(style.name);
    const colorData:colorType = {
      name: name,
      slug: slug,
      color: 'rgba(' + toRgba(color, Number(style.paints[0].opacity)) + ')'
    }
    return JSON.stringify(colorData);
  }).join(",");
  figma.ui.postMessage({ type: "render", body: colors });
}