function addEventHandler(element, type, callback) {
    element.addEventListener(type, callback, false);
}
function getMousePosition(canvas, event, zoom) {
    if (zoom === void 0) { zoom = 100; }
    var ZRect = canvas.getBoundingClientRect();
    var xFloat = (event.clientX - ZRect.left) * (100 / zoom);
    var yFloat = (event.clientY - ZRect.top) * (100 / zoom);
    return { x: Math.round(xFloat), y: Math.round(yFloat) };
}
function getContextImgData(context) {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
}
var Toolbox = (function () {
    function Toolbox(canvas, savingCanvas, toolbox, toolboxStyles) {
        this.__selectedToolIdx = null;
        this.__styleSettings = new StyleSettings();
        this.__canvas = canvas;
        this.__savingCanvas = savingCanvas;
        var canvasContainer = this.__canvas.parentElement;
        this.__origWidth = canvasContainer.clientWidth - 10;
        this.__origHeight = canvasContainer.clientHeight - 12;
        this.setCanvasWidth(this.__canvas, this.__origWidth, this.__origHeight);
        this.setCanvasWidth(this.__savingCanvas, this.__origWidth, this.__origHeight);
        this.__context = this.__canvas.getContext("2d");
        this.__savingContext = this.__savingCanvas.getContext("2d");
        this.__toolboxElem = toolbox;
        this.__toolboxStylesElem = toolboxStyles;
        this.createToolbox();
        window.addEventListener("click", function (evt) {
            ToolboxHelper.closeMenu();
        }, true);
        this.addCanvasEventHandlers();
        this.updateContextWithStyles(this.__context);
    }
    Toolbox.prototype.updateWithZoom = function (zoom) {
        var imgData = getContextImgData(this.__context);
        this.__canvas.style.width = this.__origWidth * (zoom / 100) + "px";
        this.__canvas.style.height = this.__origHeight * (zoom / 100) + "px";
        this.__prevZoom = zoom;
    };
    Toolbox.prototype.saveImage = function () {
        var dataURL = this.__savingCanvas.toDataURL();
        window.open(dataURL);
    };
    Toolbox.prototype.setCanvasWidth = function (canvasElem, width, height) {
        canvasElem.width = width;
        canvasElem.height = height;
    };
    Toolbox.prototype.addCanvasEventHandlers = function () {
        var box = this;
        addEventHandler(this.__canvas, "mousedown", function (event) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseDown(getMousePosition(box.__canvas, event, box.__prevZoom), box.__context, box.__savingContext);
            }
        });
        addEventHandler(this.__canvas, "mousemove", function (event) {
            var x = document.getElementById("canvas-pos-x");
            var y = document.getElementById("canvas-pos-y");
            var mousePos = getMousePosition(box.__canvas, event, box.__prevZoom);
            if (x && y && mousePos) {
                x.innerText = "x: " + mousePos.x;
                y.innerText = "y: " + mousePos.y;
            }
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseMove(mousePos, box.__context, box.__savingContext);
            }
        });
        addEventHandler(this.__canvas, "mouseup", function (event) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseUp(getMousePosition(box.__canvas, event, box.__prevZoom), box.__context, box.__savingContext);
            }
        });
        addEventHandler(window, "keydown", function (event) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].keyPress(event, box.__context, box.__savingContext);
            }
        });
        addEventHandler(window, "mouseout", function (event) {
            var x = document.getElementById("canvas-pos-x");
            var y = document.getElementById("canvas-pos-y");
            if (x && y) {
                x.innerText = "x: ";
                y.innerText = "y: ";
            }
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseUp(getMousePosition(box.__canvas, event, box.__prevZoom), box.__context, box.__savingContext);
            }
        });
    };
    Toolbox.prototype.updateContextWithStyles = function (context) {
        context.lineWidth = this.__styleSettings.stroke.weight;
        context.strokeStyle = this.__styleSettings.stroke.color;
        context.fillStyle = this.__styleSettings.fillColor.color;
        context.font = this.__styleSettings.font.size + "px " + this.__styleSettings.font.name;
    };
    Toolbox.prototype.createToolbox = function () {
        this.__tools = [new Cursor(this.__styleSettings), new Pencil(this.__styleSettings), new Line(this.__styleSettings), new Scribble(this.__styleSettings), new Square(this.__styleSettings), new Circle(this.__styleSettings), new TextTool(this.__styleSettings), new Eraser(this.__styleSettings)];
        this.__selectedToolIdx = 0;
        for (var i = 0; i < this.__tools.length; i++) {
            var tool = this.__tools[i];
            var boxButton = document.createElement("button");
            boxButton.setAttribute("id", "toolboxbutton_" + i);
            var buttonCSS = "toolbox-button";
            if (i === this.__selectedToolIdx) {
                buttonCSS += " selected";
            }
            boxButton.setAttribute("class", buttonCSS);
            var svgIcon = tool.svgIcon;
            if (svgIcon) {
                boxButton.innerHTML = svgIcon;
            }
            else {
                boxButton.innerText = tool.altText;
            }
            this.__toolboxElem.appendChild(boxButton);
            this.addToolboxClickHandler(boxButton, i);
        }
        this.createToolboxStyles();
    };
    Toolbox.prototype.addToolboxClickHandler = function (button, toolIdx) {
        var classContext = this;
        button.addEventListener("click", function () {
            classContext.toolboxButtonClicked(toolIdx);
        }, false);
    };
    Toolbox.prototype.toolboxButtonClicked = function (toolIdx) {
        if (this.__selectedToolIdx !== null) {
            this.__tools[this.__selectedToolIdx].stopDrawing(this.__context, this.__savingContext);
            var prevbutton = document.getElementById("toolboxbutton_" + this.__selectedToolIdx);
            prevbutton.className = "toolbox-button";
        }
        var button = document.getElementById("toolboxbutton_" + toolIdx);
        button.className += " selected";
        this.__selectedToolIdx = toolIdx;
    };
    Toolbox.prototype.createToolboxStyles = function () {
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_font", { class: "toolbox-button" }, "Abc", { font: ".75em " + this.__styleSettings.font.name }, ToolboxHelper.createFontMenu));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_fontSize", { class: "toolbox-button" }, "" + this.__styleSettings.font.size, { fontSize: "1em" }, ToolboxHelper.createFontSizeMenu));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "input", "toolboxStylebutton_fillColor_input", { type: "color", style: "display: none", onchange: "toolbox.changeFillColor();" }, "", {}, null));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_fillColor", { class: "toolbox-button" }, Fill.getFillColorSVG(null), {}, function () {
            document.getElementById("toolboxStylebutton_fillColor_input").click();
        }));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "input", "toolboxStylebutton_strokeColor_input", { type: "color", style: "display: none", onchange: "toolbox.changeStrokeColor();" }, "", {}, null));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_strokeColor", { class: "toolbox-button" }, Stroke.getStrokeColorSVG(this.__styleSettings.stroke.color), {}, function () {
            document.getElementById("toolboxStylebutton_strokeColor_input").click();
        }));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_strokeWeight", { class: "toolbox-button" }, '<svg height="20" width="20"><line x1="0" y1="10" x2="20" y2="10" style="stroke:black;stroke-width:2" /></svg>', {}, ToolboxHelper.createStrokeMenu));
        this.__toolboxStylesElem.appendChild(ToolboxHelper.createStyleButton(this, "button", "toolboxStylebutton_pixelWeight", { class: "toolbox-button" }, '<svg height="20" width="20"><circle cx="10" cy="10" r="2" style="fill:black;" /></svg>', {}, ToolboxHelper.createPixelWeightMenu));
    };
    Toolbox.prototype.changeStrokeColor = function () {
        var inputElem = document.getElementById("toolboxStylebutton_strokeColor_input");
        var colorVal = inputElem.value;
        if (colorVal) {
            this.__styleSettings.stroke.color = colorVal;
            this.__context.strokeStyle = colorVal;
            document.getElementById("toolboxStylebutton_strokeColor").innerHTML = Stroke.getStrokeColorSVG(colorVal);
        }
        this.updateContextWithStyles(this.__context);
    };
    Toolbox.prototype.changeFillColor = function () {
        var inputElem = document.getElementById("toolboxStylebutton_fillColor_input");
        var colorVal = inputElem.value;
        if (colorVal) {
            this.__styleSettings.fillColor.color = colorVal;
            this.__context.fillStyle = colorVal;
            document.getElementById("toolboxStylebutton_fillColor").innerHTML = Fill.getFillColorSVG(colorVal);
        }
        this.updateContextWithStyles(this.__context);
    };
    Toolbox.prototype.changeStroke = function (stroke, box) {
        box.__styleSettings.stroke.weight = stroke;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_strokeWeight");
        toolbox.innerHTML = '<svg height="20" width="20"><line x1="0" y1="10" x2="20" y2="10" style="stroke:black;stroke-width:' + stroke + '" /></svg>';
        this.updateContextWithStyles(this.__context);
    };
    Toolbox.prototype.changePixelWeight = function (pixels, box) {
        box.__styleSettings.pixelWeight = pixels;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_pixelWeight");
        toolbox.innerHTML = '<svg height="20" width="20"><circle cx="10" cy="10" r="' + pixels + '" style="fill:black;" /></svg>';
        this.updateContextWithStyles(this.__context);
    };
    Toolbox.prototype.changeFont = function (font, box) {
        box.__styleSettings.font.name = font;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_font");
        toolbox.style.font = "0.75em " + font;
        box.__context.font = box.__styleSettings.font.size + "px " + box.__styleSettings.font.name;
        this.updateContextWithStyles(this.__context);
    };
    Toolbox.prototype.changeFontSize = function (fontSize, box) {
        box.__styleSettings.font.size = +fontSize;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_fontSize");
        toolbox.innerText = fontSize;
        box.__context.font = box.__styleSettings.font.size + "px " + box.__styleSettings.font.name;
        this.updateContextWithStyles(this.__context);
    };
    return Toolbox;
}());
Toolbox.__menuDiv = null;
var StyleSettings = (function () {
    function StyleSettings(fillColor, stroke, font) {
        this.fillColor = new Fill();
        this.stroke = new Stroke();
        this.font = new Font();
        this.pixelWeight = 2;
        if (fillColor) {
            this.fillColor = fillColor;
        }
        if (stroke) {
            this.stroke = stroke;
        }
        if (font) {
            this.font = font;
        }
    }
    StyleSettings.noColorSVG = function () {
        return '<svg height="27" width="26" style="margin: 0"><line x1="0" y1="27" x2="26" y2="0" style="stroke:red ;stroke-width:2" /></svg>';
    };
    return StyleSettings;
}());
var Fill = (function () {
    function Fill(color) {
        if (color === void 0) { color = "transparent"; }
        this.color = color;
    }
    Fill.getFillColorSVG = function (color) {
        if (!color) {
            return '<svg height="20" width="20"><g><line x1="19" y1="1" x2="1" y2="19" style="stroke:red ;stroke-width:2" /><rect x="0" y="0" width="20" height="20" rx="4" ry="4" style="stroke:black;stroke-width:1;fill:none;" /></g></svg>';
        }
        return '<svg height="20" width="20"><rect x="0" y="0" width="20" height="20" rx="4" ry="4" style="stroke:black;stroke-width:1;fill:' + color + ';" /></svg>';
    };
    return Fill;
}());
var Stroke = (function () {
    function Stroke(color, weight) {
        if (color === void 0) { color = "black"; }
        if (weight === void 0) { weight = 2; }
        this.color = color;
        this.weight = weight;
    }
    Stroke.getStrokeColorSVG = function (color) {
        return '<svg height="20" width="20"><line x1="0" y1="0" x2="20" y2="20" style="stroke:' + color + ';stroke-width:2" /></svg>';
    };
    return Stroke;
}());
var Font = (function () {
    function Font(name, size) {
        if (name === void 0) { name = "Arial"; }
        if (size === void 0) { size = 24; }
        this.name = name;
        this.size = size;
    }
    return Font;
}());
//# sourceMappingURL=toolbox.js.map