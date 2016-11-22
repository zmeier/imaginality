/// <reference path="toolbox.ts"/>

var toolbox: Toolbox;

function onLoaded() {
    createToolbox();
}

function createToolbox() {
    var canvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    var savingCanvas = document.getElementById("saving-canvas") as HTMLCanvasElement;
    var toolboxTools = document.getElementById("toolbox-tools");
    var toolboxStyles = document.getElementById("toolbox-styles");
    toolbox = new Toolbox(canvas, savingCanvas, toolboxTools, toolboxStyles);
}

function sliderchanged() {
    var zoomSlider = document.getElementById("canvas-zoom-range") as HTMLInputElement;
    var zoomText = document.getElementById("canvas-zoom-level") as HTMLInputElement;
    var zoom = zoomSlider.value;
    zoomText.value = zoom;
    toolbox.updateWithZoom(+zoom);
}

function changeZoom() {
    var zoomSlider = document.getElementById("canvas-zoom-range") as HTMLInputElement;
    var zoomText = document.getElementById("canvas-zoom-level") as HTMLInputElement;
    var zoomLevel = zoomText.value;

    if ((+zoomLevel >= +zoomSlider.min) && (+zoomLevel <= +zoomSlider.max)) {
        zoomSlider.value = zoomLevel;
        toolbox.updateWithZoom(+zoomLevel);
    } else {
        zoomText.value = zoomSlider.value;
    }
}

function saveImage() {
    toolbox.saveImage;
}