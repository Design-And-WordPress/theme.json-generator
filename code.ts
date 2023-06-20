interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

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
  return camelizedWords
    .replace(/[A-Z]/g, (c) => {
      return "_" + c.toLowerCase();
    })
    .slice(1);
};

// get all colors on page
const extractColors = (node: SceneNode, colorSet: Set<string>): void => {
  if ("fills" in node) {
    const fills = node.fills as ReadonlyArray<Paint>;
    for (const fill of fills) {
      if (fill.type === "SOLID" && fill.visible !== false) {
        const color: Color = {
          r: fill.color.r,
          g: fill.color.g,
          b: fill.color.b,
          a: fill.opacity,
        };
        // Add the color to the set, represented as a string
        colorSet.add(JSON.stringify(color));
      }
    }
  }

  if ("children" in node) {
    for (const child of node.children) {
      extractColors(child, colorSet);
    }
  }
};

if (figma.editorType === "figma") {
  let colors = styles
    .map((style) => {
      if (style.paints[0].type !== "SOLID") {
        // 単色でなければスキップ
        return;
      }

      const color = style.paints[0].color;
      const slug = snakeCase(style.name);
      const name = snakeCase(style.name);
      const colorData: colorType = {
        name: name,
        slug: slug,
        color: "rgba(" + toRgba(color, Number(style.paints[0].opacity)) + ")",
      };

      return JSON.stringify(colorData);
    })
    .join(",\n");

  // スタイルが設定されてなかったら、使われているカラーを抜き出す
  if (colors === "") {
    const colorSet: Set<string> = new Set();

    for (const page of figma.root.children) {
      for (const child of page.children) {
        extractColors(child, colorSet);
      }
    }

    // Convert the set back to an array of objects
    const pageColors: Color[] = Array.from(colorSet).map((colorStr) =>
      JSON.parse(colorStr)
    );

    const noStyledColors = pageColors
      .map((color, index) => {
        const colorData: colorType = {
          name: String(index),
          slug: String(index),
          color: "rgba(" + toRgba(color, color.a ? color.a : 1) + ")",
        };
        return JSON.stringify(colorData);
      })
      .join(",\n");
    colors = noStyledColors;
  }

  figma.ui.postMessage({ type: "render", body: colors });
}
