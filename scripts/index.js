var toolbox;
function onLoaded() {
    createToolbox();
}
function createToolbox() {
    var canvas = document.getElementById("drawing-canvas");
    var savingCanvas = document.getElementById("saving-canvas");
    var toolboxTools = document.getElementById("toolbox-tools");
    var toolboxStyles = document.getElementById("toolbox-styles");
    toolbox = new Toolbox(canvas, savingCanvas, toolboxTools, toolboxStyles);
}
function sliderchanged() {
    var zoomSlider = document.getElementById("canvas-zoom-range");
    var zoomText = document.getElementById("canvas-zoom-level");
    var zoom = zoomSlider.value;
    zoomText.value = zoom;
    toolbox.updateWithZoom(+zoom);
}
function changeZoom() {
    var zoomSlider = document.getElementById("canvas-zoom-range");
    var zoomText = document.getElementById("canvas-zoom-level");
    var zoomLevel = zoomText.value;
    if ((+zoomLevel >= +zoomSlider.min) && (+zoomLevel <= +zoomSlider.max)) {
        zoomSlider.value = zoomLevel;
        toolbox.updateWithZoom(+zoomLevel);
    }
    else {
        zoomText.value = zoomSlider.value;
    }
}
function saveImage() {
    toolbox.saveImage;
}
//# sourceMappingURL=index.js.map