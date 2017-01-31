/// <reference path="tools.ts" />

/**
 * Add an event handler to an element.
 * 
 * @param {*} element - element to add the handler to
 * @param {string} type - the type of event to listen for
 * @param {*} callback - callback when the event is triggered
 */
function addEventHandler(element: any, type: string, callback: any) {
    element.addEventListener(type, callback, false);
}

/**
 * Get the position of the cursor.
 * 
 * @param {HTMLCanvasElement} canvas - reference to the drawing canvas to find mouse position on
 * @param {MouseEvent} event - mouse event that contains the mouse position
 * @param {number} [zoom=100] - zoom of the canvas to scale the position
 * @returns {ZPosition}
 */
function getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent, zoom: number = 100): ZPosition {
    var ZRect = canvas.getBoundingClientRect();
    var xFloat = (event.clientX - ZRect.left) * (100 / zoom);
    var yFloat = (event.clientY - ZRect.top) * (100 / zoom);

    return { x: Math.round(xFloat), y: Math.round(yFloat) };
}

/**
 * Get the image data from a canvas' context.
 * 
 * @param {CanvasRenderingContext2D} context - context of the canvas to get the image data from
 * @returns {ImageData}
 */
function getContextImgData(context: CanvasRenderingContext2D): ImageData {
    return context.getImageData(0, 0, context.canvas.width, context.canvas.height);
}

/**
 * Toolbox class that contains many tools that can be used to manipulate
 * the pixels on a canvas element.
 * 
 * @class Toolbox
 */
class Toolbox {
    //=================================
    // Toolbox
    //=================================
    static __menuDiv: HTMLElement = null;
    private __toolboxElem: HTMLElement;
    private __selectedToolIdx: number = null;
    private __toolboxStylesElem: HTMLElement;
    //=================================
    // Canvas state private members
    //=================================
    private __canvas: HTMLCanvasElement;
    private __context: CanvasRenderingContext2D;
    private __savingCanvas: HTMLCanvasElement;
    private __savingContext: CanvasRenderingContext2D;
    private __origWidth: number;
    private __origHeight: number;
    //=================================
    // Style settings
    //=================================
    private __styleSettings: StyleSettings = new StyleSettings();
    //=================================
    // General state properties
    //=================================
    private __prevZoom: number;
    private __tools: Tool[];

    /**
     * Creates an instance of Toolbox.
     * 
     * @param {HTMLCanvasElement} canvas - drawing canvas element
     * @param {HTMLCanvasElement} savingCanvas - saving canvas element
     * @param {HTMLElement} toolbox - element for the toolbox
     * @param {HTMLElement} toolboxStyles - element for the toolbox styles
     * 
     * @memberOf Toolbox
     */
    constructor(canvas: HTMLCanvasElement, savingCanvas: HTMLCanvasElement, toolbox: HTMLElement, toolboxStyles: HTMLElement) {
        // Get references to the canvas elements
        this.__canvas = canvas;
        this.__savingCanvas = savingCanvas;

        // Determine what the size of the drawing canvas should be
        var canvasContainer: HTMLElement = this.__canvas.parentElement;
        this.__origWidth = canvasContainer.clientWidth - 10;
        this.__origHeight = canvasContainer.clientHeight - 12;
        this.setCanvasWidth(this.__canvas, this.__origWidth, this.__origHeight);
        this.setCanvasWidth(this.__savingCanvas, this.__origWidth, this.__origHeight);

        // Setup the context for the canvases
        this.__context = this.__canvas.getContext("2d");
        this.__savingContext = this.__savingCanvas.getContext("2d");

        // Create the toolbox
        this.__toolboxElem = toolbox;
        this.__toolboxStylesElem = toolboxStyles;
        this.createToolbox();

        window.addEventListener("click", function (evt) {
            ToolboxHelper.closeMenu();
        }, true);

        // Update the canvas event handlers
        this.addCanvasEventHandlers();

        // Update styles
        this.updateContextWithStyles(this.__context);
    }

    //=================================
    // Public methods
    //=================================
    /**
     * Update the canvas with the new zoom level.
     * 
     * @param {number} zoom - zoom level to set the canvas to
     * 
     * @memberOf Toolbox
     */
    public updateWithZoom(zoom: number): void {
        var imgData = getContextImgData(this.__context);
        this.__canvas.style.width = this.__origWidth * (zoom / 100) + "px";
        this.__canvas.style.height = this.__origHeight * (zoom / 100) + "px";
        this.__prevZoom = zoom;
    }

    /**
     * Save the image data and open it up in a new window.
     * 
     * @memberOf Toolbox
     */
    public saveImage() {
        var dataURL = this.__savingCanvas.toDataURL();
        window.open(dataURL);
    }

    //=================================
    // Private methods
    //=================================
    /**
     * Set the size of the canvas.
     * 
     * @private
     * @param {HTMLCanvasElement} canvasElem - reference to the canvas element
     * @param {number} width - width of the canvas
     * @param {number} height - height of the canvas
     * 
     * @memberOf Toolbox
     */
    private setCanvasWidth(canvasElem: HTMLCanvasElement, width: number, height: number) {
        canvasElem.width = width;
        canvasElem.height = height;
    }

    /**
     * Add event handlers to the canvas for mouse down, move, up, and key pressed.
     * 
     * @private
     * 
     * @memberOf Toolbox
     */
    private addCanvasEventHandlers(): void {
        var box = this;

        // Listen for the mouse down event
        addEventHandler(this.__canvas, "mousedown", function (event: MouseEvent) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseDown(getMousePosition(box.__canvas, event, box.__prevZoom), box.__context, box.__savingContext);
            }
        });
        // Listen for the mouse move event
        addEventHandler(this.__canvas, "mousemove", function (event: MouseEvent) {
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
        // Listen for the mouse up event
        addEventHandler(this.__canvas, "mouseup", function (event: MouseEvent) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].mouseUp(getMousePosition(box.__canvas, event, box.__prevZoom), box.__context, box.__savingContext);
            }
        });
        // Listen for the keydown event
        addEventHandler(window, "keydown", function (event: KeyboardEvent) {
            if (box && box.__tools && box.__selectedToolIdx !== null) {
                box.__tools[box.__selectedToolIdx].keyPress(event, box.__context, box.__savingContext);
            }
        });
        // Listen for the mouse out event to stop drawing on the canvas
        addEventHandler(window, "mouseout", function (event: MouseEvent) {
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
    }

    /**
     * Update the context with a new set of styles based on our style settings.
     * 
     * @private
     * @param {CanvasRenderingContext2D} context - context to add styles to
     * 
     * @memberOf Toolbox
     */
    private updateContextWithStyles(context: CanvasRenderingContext2D): void {
        context.lineWidth = this.__styleSettings.stroke.weight;
        context.strokeStyle = this.__styleSettings.stroke.color;
        context.fillStyle = this.__styleSettings.fillColor.color;
        context.font = this.__styleSettings.font.size + "px " + this.__styleSettings.font.name;
    }

    /**
     * Create the toolbox with the list of all of the possible tools for use.
     * 
     * @private
     * 
     * @memberOf Toolbox
     */
    private createToolbox(): void {
        this.__tools = [new Cursor(this.__styleSettings), new Pencil(this.__styleSettings), new Line(this.__styleSettings), new Scribble(this.__styleSettings), new Square(this.__styleSettings), new Circle(this.__styleSettings), new TextTool(this.__styleSettings), new Eraser(this.__styleSettings)];
        this.__selectedToolIdx = 0;
        for (var i = 0; i < this.__tools.length; i++) {
            var tool: Tool = this.__tools[i];
            var boxButton: HTMLButtonElement = document.createElement("button");
            boxButton.setAttribute("id", "toolboxbutton_" + i);
            var buttonCSS: string = "toolbox-button";
            if (i === this.__selectedToolIdx) {
                buttonCSS += " selected";
            }
            boxButton.setAttribute("class", buttonCSS);
            var svgIcon = tool.svgIcon;
            if (svgIcon) {
                boxButton.innerHTML = svgIcon;
            } else {
                boxButton.innerText = tool.altText;
            }
            this.__toolboxElem.appendChild(boxButton);
            this.addToolboxClickHandler(boxButton, i);
        }

        this.createToolboxStyles();
    }

    /**
     * Add a click handler to a toolbox button.
     * 
     * @private
     * @param {HTMLButtonElement} button - button element to add the click handler to
     * @param {number} toolIdx - index of the tool to be used in the callback
     * 
     * @memberOf Toolbox
     */
    private addToolboxClickHandler(button: HTMLButtonElement, toolIdx: number): void {
        var classContext: Toolbox = this;
        button.addEventListener("click", function () {
            classContext.toolboxButtonClicked(toolIdx);
        }, false);
    }

    /**
     * Handler for when a toolbox button is clicked that will select the new tool.
     * 
     * @private
     * @param {number} toolIdx - index of the tool in the toolbox
     * 
     * @memberOf Toolbox
     */
    private toolboxButtonClicked(toolIdx: number): void {
        if (this.__selectedToolIdx !== null) {
            this.__tools[this.__selectedToolIdx].stopDrawing(this.__context, this.__savingContext);
            var prevbutton = document.getElementById("toolboxbutton_" + this.__selectedToolIdx) as HTMLButtonElement;
            prevbutton.className = "toolbox-button";
        }
        var button = document.getElementById("toolboxbutton_" + toolIdx) as HTMLButtonElement;
        button.className += " selected";
        this.__selectedToolIdx = toolIdx;
    }
    
    /**
     * Create a new button for each style that can be applied to the tools.
     * 
     * @private
     * 
     * @memberOf Toolbox
     */
    private createToolboxStyles() {
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
    }

    //=================================
    // Event handlers
    //=================================
    /**
     * Handler for the on change event for the stroke color selection.
     * 
     * @memberOf Toolbox
     */
    public changeStrokeColor(): void {
        var inputElem = document.getElementById("toolboxStylebutton_strokeColor_input") as HTMLInputElement;
        var colorVal = inputElem.value;
        if (colorVal) {
            this.__styleSettings.stroke.color = colorVal;
            this.__context.strokeStyle = colorVal;
            document.getElementById("toolboxStylebutton_strokeColor").innerHTML = Stroke.getStrokeColorSVG(colorVal);
        }
        this.updateContextWithStyles(this.__context);
    }

    /**
     * Handler for the on change event for the fill color selection.
     * 
     * @memberOf Toolbox
     */
    public changeFillColor(): void {
        var inputElem = document.getElementById("toolboxStylebutton_fillColor_input") as HTMLInputElement;
        var colorVal = inputElem.value;
        if (colorVal) {
            this.__styleSettings.fillColor.color = colorVal;
            this.__context.fillStyle = colorVal;
            document.getElementById("toolboxStylebutton_fillColor").innerHTML = Fill.getFillColorSVG(colorVal);
        }
        this.updateContextWithStyles(this.__context);
    }
    
    /**
     * Handler for changing the stroke style
     * 
     * @param {number} stroke - stroke weight to set
     * @param {Toolbox} box - toolbox element to change the styles on
     * 
     * @memberOf Toolbox
     */
    public changeStroke(stroke: number, box: Toolbox): void {
        box.__styleSettings.stroke.weight = stroke;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_strokeWeight");
        toolbox.innerHTML = '<svg height="20" width="20"><line x1="0" y1="10" x2="20" y2="10" style="stroke:black;stroke-width:' + stroke + '" /></svg>';
        this.updateContextWithStyles(this.__context);
    }

    /**
     * Handler for changing the pixel weight.
     * 
     * @param {number} pixels - number of pixels radius for the pencil tool
     * @param {Toolbox} box - toolbox element to change the styles on
     * 
     * @memberOf Toolbox
     */
    public changePixelWeight(pixels: number, box: Toolbox): void {
        box.__styleSettings.pixelWeight = pixels;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_pixelWeight");
        toolbox.innerHTML = '<svg height="20" width="20"><circle cx="10" cy="10" r="' + pixels + '" style="fill:black;" /></svg>';
        this.updateContextWithStyles(this.__context);
    }

    /**
     * Handler for the changing of the font.
     * 
     * @param {string} font - new font to be used for the text tool
     * @param {Toolbox} box - toolbox element to change the font 
     * 
     * @memberOf Toolbox
     */
    public changeFont(font: string, box: Toolbox): void {
        box.__styleSettings.font.name = font;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_font");
        toolbox.style.font = "0.75em " + font;
        box.__context.font = box.__styleSettings.font.size + "px " + box.__styleSettings.font.name;
        this.updateContextWithStyles(this.__context);
    }

    /**
     * Handler for the changing of the font size.
     * 
     * @param {string} fontSize - pixel size for the text tool
     * @param {Toolbox} box - toolbox element to change the font size
     * 
     * @memberOf Toolbox
     */
    public changeFontSize(fontSize: string, box: Toolbox): void {
        box.__styleSettings.font.size = +fontSize;
        ToolboxHelper.closeMenu();
        var toolbox = document.getElementById("toolboxStylebutton_fontSize");
        toolbox.innerText = fontSize;
        box.__context.font = box.__styleSettings.font.size + "px " + box.__styleSettings.font.name;
        this.updateContextWithStyles(this.__context);
    }
}

//=================================
// Helper classes for styles
//=================================

/**
 * Style settings class that is used to hold the settings for the application
 * 
 * @class StyleSettings
 */
class StyleSettings {
    //=================================
    // Public properties
    //=================================
    public fillColor: Fill = new Fill();
    public stroke: Stroke = new Stroke();
    public font: Font = new Font();
    public pixelWeight: number = 2;

    /**
     * Creates an instance of StyleSettings.
     * 
     * @param {Fill} [fillColor] - style for the fill
     * @param {Stroke} [stroke] - stroke weight
     * @param {Font} [font] - font style
     * 
     * @memberOf StyleSettings
     */
    constructor(fillColor?: Fill, stroke?: Stroke, font?: Font) {
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

    /**
     * Get the SVG to represent no color.
     * 
     * @static
     * @returns {string}
     * 
     * @memberOf StyleSettings
     */
    public static noColorSVG(): string {
        return '<svg height="27" width="26" style="margin: 0"><line x1="0" y1="27" x2="26" y2="0" style="stroke:red ;stroke-width:2" /></svg>';
    }
}

/**
 * Fill class that represents a color that can be filled with.
 * 
 * @class Fill
 */
class Fill {
    //=================================
    // Public properties
    //=================================
    public color: string;

    /**
     * Creates an instance of Fill.
     * 
     * @param {string} [color="transparent"] - color of the string
     * 
     * @memberOf Fill
     */
    constructor(color: string = "transparent") {
        this.color = color;
    }

    /**
     * Get the SVG to represent a color selected for fill.
     * 
     * @static
     * @param {string} color - color to be represented
     * @returns
     * 
     * @memberOf Fill
     */
    public static getFillColorSVG(color: string) {
        if (!color) {
            return '<svg height="20" width="20"><g><line x1="19" y1="1" x2="1" y2="19" style="stroke:red ;stroke-width:2" /><rect x="0" y="0" width="20" height="20" rx="4" ry="4" style="stroke:black;stroke-width:1;fill:none;" /></g></svg>';
        }
        return '<svg height="20" width="20"><rect x="0" y="0" width="20" height="20" rx="4" ry="4" style="stroke:black;stroke-width:1;fill:' + color + ';" /></svg>';
    }
}

/**
 * Stroke class that contains the color and weight.
 * 
 * @class Stroke
 */
class Stroke {
    //=================================
    // Public properties
    //=================================
    public color: string;
    public weight: number;

    /**
     * Creates an instance of Stroke.
     * 
     * @param {string} [color="black"] - color of the stroke
     * @param {number} [weight=2] - weight of the stroke
     * 
     * @memberOf Stroke
     */
    constructor(color: string = "black", weight: number = 2) {
        this.color = color;
        this.weight = weight;
    }

    /**
     * Get the SVG to represent the stroke width and color.
     * 
     * @static
     * @param {string} color - color of the stroke
     * @returns {string}
     * 
     * @memberOf Stroke
     */
    public static getStrokeColorSVG(color: string): string {
        return '<svg height="20" width="20"><line x1="0" y1="0" x2="20" y2="20" style="stroke:' + color + ';stroke-width:2" /></svg>';
    }
}

/**
 * Font class to hold the name and size of text.
 * 
 * @class Font
 */
class Font {
    //=================================
    // Public properties
    //=================================
    public name: string;
    public size: number;

    /**
     * Creates an instance of Font.
     * 
     * @param {string} [name="Arial"] - font for the text
     * @param {number} [size=24] - pixels for the text
     * 
     * @memberOf Font
     */
    constructor(name: string = "Arial", size: number = 24) {
        this.name = name;
        this.size = size;
    }
}

/**
 * Interface for a position object that has an x and y.
 * 
 * @interface ZPosition
 */
interface ZPosition {
    x: number;
    y: number;
}

/**
 * Interface for a rectangle object that has a position and a height and a width.
 * 
 * @interface ZRect
 */
interface ZRect {
    pos: ZPosition;
    width: number;
    height: number;
}

/**
 * Interface for the bounding positions of a rectangle.
 * 
 * @interface ZBoundingPositions
 */
interface ZBoundingPositions {
    left: number;
    right: number;
    top: number;
    bottom: number;
}