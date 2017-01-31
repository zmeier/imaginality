/// <reference path="toolbox.ts"/>

var toolbox: Toolbox;

/**
 * The on loaded event that will create the toolbox for the application.
 */
function onLoaded() {
    createToolbox();
}

/**
 * Create the set of tools that can be used with the application.
 */
function createToolbox() {
    var canvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    var savingCanvas = document.getElementById("saving-canvas") as HTMLCanvasElement;
    var toolboxTools = document.getElementById("toolbox-tools");
    var toolboxStyles = document.getElementById("toolbox-styles");
    toolbox = new Toolbox(canvas, savingCanvas, toolboxTools, toolboxStyles);
}

/**
 * Handler for when the slider is changed that will change the zoom level of the canvas.
 */
function sliderchanged() {
    var zoomSlider = document.getElementById("canvas-zoom-range") as HTMLInputElement;
    var zoomText = document.getElementById("canvas-zoom-level") as HTMLInputElement;
    var zoom = zoomSlider.value;
    zoomText.value = zoom;
    toolbox.updateWithZoom(+zoom);
}

/**
 * Change the zoom level for the canvas. Eventually, this should be improved so
 * that we scale the data appropriately.
 */
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

/**
 * Save the current canvas's image.
 */
function saveImage() {
    toolbox.saveImage();
}