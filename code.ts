figma.showUI(__html__);
figma.ui.resize(800, 800);

// 現在のファイルの塗りのスタイルを取得
const styles = figma.getLocalPaintStyles();

if (figma.editorType === "figma") {
  figma.ui.onmessage = (message) => {
    console.log(message);
    let currentData;
    currentData = styles;

    figma.ui.postMessage({ type: "render", body: currentData });
  };
}