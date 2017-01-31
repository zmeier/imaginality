/// <reference path="toolbox.ts" />

/**
 * Clear the passed in canvas so that it is blank.
 * 
 * @param {CanvasRenderingContext2D} context - context of the canvas element
 */
function clearCanvas(context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

/**
 * Abstract class that represents a tool that can be used within the 
 * toolbox of the paint application.
 * 
 * @abstract
 * @class Tool
 */
abstract class Tool {
    //=================================
    // Private properties
    //=================================
    protected __isDrawing: boolean;
    protected __lastDrawingPosition?: ZPosition;
    protected __tempImageData: ImageData;
    protected __isDirty: boolean;
    protected __styleSettings: StyleSettings;
    
    //=================================
    // Public get-only properties
    //=================================
    private __name: string;
    private __svgicon: string;
    private __altText: string;
    
    /**
     * Get the name of the tool.
     * 
     * @readonly
     * @type {string}
     * @memberOf Tool
     */
    public get name(): string {
        return this.__name;
    }

    /**
     * Get the SVG icon that should be used with this tools' display.
     * 
     * @readonly
     * @type {string}
     * @memberOf Tool
     */
    public get svgIcon(): string {
        return this.__svgicon;
    }

    /**
     * Get the alternative text for the tool image.
     * 
     * @readonly
     * @type {string}
     * @memberOf Tool
     */
    public get altText(): string {
        return this.__altText;
    }

    /**
     * Set the tool as being selected, which will stop the current
     * drawing action.
     * 
     * @memberOf Tool
     */
    public toolSelected(): void {
        this.__isDrawing = false;
    }

    /**
     * Creates an instance of Tool.
     * 
     * @param {string} name - name of the tool to create
     * @param {string} svgIcon - SVG of the icon to display on the button
     * @param {string} altText - text alternative of the image
     * @param {StyleSettings} styleSettings - style settings
     * 
     * @memberOf Tool
     */
    constructor(name: string, svgIcon: string, altText: string, styleSettings: StyleSettings) {
        this.__name = name;
        this.__svgicon = svgIcon;
        this.__altText = altText;
        this.__styleSettings = styleSettings;
    }

    //================================= 
    // Protected utility methods
    //=================================
    /**
     * Start drawing using the current tool.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} [context] - context of the canvas being drawn on
     * 
     * @memberOf Tool
     */
    public startDrawing(mousePosition: ZPosition, context?: CanvasRenderingContext2D): void {
        this.__isDirty = true;
        this.__isDrawing = true;
        this.__lastDrawingPosition = mousePosition;

        if (context) {
            this.__tempImageData = getContextImgData(context);
        }
    }

    
    /**
     * Stop drawing using the current tool.
     * 
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on 
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas that has all of the saved data
     * 
     * @memberOf Tool
     */
    public stopDrawing(context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (context && savingContext) {
            this.copyContextToSave(context, savingContext);
            context.restore();
        }
        this.__isDrawing = false;
        this.__lastDrawingPosition = null;
    }

    //=================================
    // Drawing helper methods
    //=================================
    /**
     * Copy the context from the drawing context to the saving context.
     * 
     * @private
     * @param {CanvasRenderingContext2D} context - context of the canvas that was drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas that should be saved to
     * 
     * @memberOf Tool
     */
    private copyContextToSave(context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        var imgData: ImageData = getContextImgData(context);
        clearCanvas(savingContext);
        savingContext.putImageData(imgData, 0, 0);
        this.__tempImageData = null;
        this.__isDirty = false;
    }

    //=================================
    // Abstract methods
    //=================================
    abstract mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
}


/**
 * Cursor tool that can be used for selecting areas of the canvas and
 * moving the drawing around.
 * 
 * @class Cursor
 * @extends {Tool}
 */
class Cursor extends Tool {
    //=================================
    // Private fields
    //=================================
    private __selectedRect?: ZRect;
    private __isDragging?: boolean;
    private __dragData?: ImageData;

    
    /**
     * Creates an instance of Cursor.
     * 
     * @param {StyleSettings} styleSettings - styles settings for the application
     * 
     * @memberOf Cursor
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M5 2 V 16 L 8 12 L 11 19 L 13 18 L 10 11 L 15.5 11.5 L 5 2" fill="transparent" stroke="black"/></svg>';
        super("cursor", svg, "Mouse", styleSettings);
    }

    
    /**
     * Select this as the current tool of use.
     * 
     * @memberOf Cursor
     */
    public toolSelected(): void {
        super.toolSelected();
        this.__selectedRect = null;
        this.__isDragging = false;
    }

    /**
     * Start using the cursor tool.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} [context] - context of the canvas being drawn on 
     * 
     * @memberOf Cursor
     */
    public startDrawing(mousePosition: ZPosition, context?: CanvasRenderingContext2D): void {
        if (context && this.__isDirty && this.__tempImageData) {
            this.__selectedRect = null;
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
        }
        super.startDrawing(mousePosition, context);
    }

    /**
     * Stop using the cursor tool.
     * 
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Cursor
     */
    public stopDrawing(context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        clearCanvas(context);
        super.stopDrawing(savingContext, context);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down of the cursor tool, which will start selecting and deselecting
     * the previous selection.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Cursor
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__selectedRect && this.clickedInRect(mousePosition, this.__selectedRect)) {
            this.__isDragging = true;
            this.__lastDrawingPosition = mousePosition;
            this.__dragData = savingContext.getImageData(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            savingContext.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            this.__tempImageData = savingContext.getImageData(0, 0, context.canvas.width, context.canvas.height);
            context.putImageData(this.__tempImageData, 0, 0);
            context.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
        } else {
            this.startDrawing(mousePosition, context);
            this.__isDragging = false;
            context.save();
            context.setLineDash([5, 5]);
            context.strokeStyle = "black";
            context.lineWidth = 1;
        }
    }

    /**
     * Handler for the mouse move of the cursor tool, which will continuously change the selection
     * on the canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Cursor
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDragging) {
            context.putImageData(this.__tempImageData, 0, 0);
            this.__selectedRect.pos.x += (mousePosition.x - this.__lastDrawingPosition.x);
            this.__selectedRect.pos.y += (mousePosition.y - this.__lastDrawingPosition.y);
            context.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
            this.drawRectangle(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height, context);
            this.__lastDrawingPosition = mousePosition;
        } else if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            this.drawRectangle(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y, context);
            var coords = this.getCoordinates({ pos: { x: this.__lastDrawingPosition.x, y: this.__lastDrawingPosition.y }, width: mousePosition.x - this.__lastDrawingPosition.x, height: mousePosition.y - this.__lastDrawingPosition.y });
            if (!this.__selectedRect) {
                this.__selectedRect = { pos: { x: null, y: null }, width: null, height: null };
            }

            this.__selectedRect.pos.x = coords.left;
            this.__selectedRect.pos.y = coords.top;
            this.__selectedRect.width = coords.right - coords.left;
            this.__selectedRect.height = coords.bottom - coords.top;
        }
    }

    /**
     * Handler for the mouse up of the cursor tool, which will stop the continuous selection
     * and all for the current selection to be moved around.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Cursor
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDragging) {
            this.__selectedRect.pos.x += mousePosition.x - this.__lastDrawingPosition.x;
            this.__selectedRect.pos.y += mousePosition.y - this.__lastDrawingPosition.y;
            savingContext.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
            this.__tempImageData = getContextImgData(savingContext);
            context.putImageData(this.__tempImageData, 0, 0);
            this.__lastDrawingPosition = null;
            this.__dragData = null;
            this.__selectedRect = null;
            //this.drawRectangle(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height, context);
        }
        else
        {
            this.__isDrawing = false;
            this.__lastDrawingPosition = null;
            this.__isDragging = false;
        }
    }
    
    /**
     * Handler for the cursor tool's key press event, which will handle the delete key. Upon
     * pressing delete, the context under the current selection will be deleted.
     * 
     * @param {KeyboardEvent} event - keyboard event object
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Cursor
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__selectedRect && event.key === "Delete") {
            context.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            savingContext.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            this.__tempImageData = getContextImgData(savingContext);
        }
    }

    //=================================
    // Private methods
    //=================================
    /**
     * Check if the cursor clicked in the middle of the selected rectangle.
     * 
     * @private
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {ZRect} rect - rectangle to check if the mouse is within
     * @returns {boolean}
     * 
     * @memberOf Cursor
     */
    private clickedInRect(mousePosition: ZPosition, rect: ZRect): boolean {
        var coords = this.getCoordinates(rect);

        if ((mousePosition.x >= coords.left && mousePosition.x <= coords.right) && (mousePosition.y >= coords.top && mousePosition.y <= coords.bottom)) {
            return true;
        }

        return false;
    }

    /**
     * Convert a rectangle into a set of bounding positions.
     * 
     * @private
     * @param {ZRect} rect - rectangle to be converted
     * @returns {ZBoundingPositions}
     * 
     * @memberOf Cursor
     */
    private getCoordinates(rect: ZRect): ZBoundingPositions {
        var left: number, right: number, top: number, bottom: number;
        if (rect.width < 0) {
            left = rect.pos.x + rect.width;
            right = rect.pos.x;
        } else {
            left = rect.pos.x;
            right = rect.pos.x + rect.width;
        }

        if (rect.height < 0) {
            top = rect.pos.y + rect.height;
            bottom = rect.pos.y;
        } else {
            top = rect.pos.y;
            bottom = rect.pos.y + rect.height;
        }
        return { left: left, right: right, top: top, bottom: bottom };
    }

     /**
     * Draw a rectangle.
     * 
     * @private
     * @param {number} x - x position
     * @param {number} y - y position
     * @param {number} w - width of the rectangle
     * @param {number} h - height of the rectangle
     * @param {CanvasRenderingContext2D} context - context of the drawing canvas
     * 
     * @memberOf Cursor
     */
    private drawRectangle(x: number, y: number, w: number, h: number, context: CanvasRenderingContext2D)
    {
        context.beginPath();
        context.rect(x, y, w, h);
        context.stroke();
        context.closePath();
    }
}

/**
 * Pencil tool that can be used for drawing many individual points on the canvas.
 * 
 * @class Pencil
 * @extends {Tool}
 */
class Pencil extends Tool {
    /**
     * Creates an instance of Pencil.
     * 
     * @param {StyleSettings} styleSettings
     * 
     * @memberOf Pencil
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M3 5 L 8 2 L 15 13 L 15 19 L 10 16 L 3 5 M 4 7.5 L 10 4" fill="transparent" stroke="black"/></svg>';
        super("pencil", svg, ".", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler of the mouse down event for the pencil tool. This will begin the drawing.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Pencil
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
        context.beginPath();
        context.fillStyle = context.strokeStyle;
        context.arc(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
        context.fill();
    }
    
    /**
     * Handler of the mouse move event for the pencil tool. While the mouse is down,
     * we will continuously draw tiny circles at each cursor location.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Pencil
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.beginPath();
            context.arc(mousePosition.x, mousePosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
            context.fill();
            this.__lastDrawingPosition = mousePosition;
        }
    }
    
    /**
     * Handler of the mouse up event for the pencil tool. This will stop the drawing with
     * the pencil tool. The drawing will be saved onto the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Pencil
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        context.restore();
        this.stopDrawing(context, savingContext);
    }

    /**
     * Handler when a key is pressed with the pencil selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Pencil
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

/**
 * Line tool that can be used for drawing straight lines on the canvas.
 * 
 * @class Line
 * @extends {Tool}
 */
class Line extends Tool {
    /**
     * Creates an instance of Line.
     * 
     * @param {StyleSettings} styleSettings - style settings for the application
     * 
     * @memberOf Line
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg height="20" width="20"><line x1="0" y1="0" x2="20" y2="20" style="stroke:black;stroke-width:1" /></svg>';
        super("line", svg, "/", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event for the line tool. This will start the drawing of a single line.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Line
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }
    
    /**
     * Handler for the mouse move event for the line tool. Each time the mouse moves, the line should
     * be redrawn so that it is a straight line from the start of drawing and the current position.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Line
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            context.beginPath();
            context.moveTo(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y);
            context.lineTo(mousePosition.x, mousePosition.y);
            context.stroke();
            context.closePath();
        }
    }
    
    /**
     * Handler for the mouse up event for the line tool. When the drawing is stopped, the line will
     * be placed between the start location and the last mouse position.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Line
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }
    
    /**
     * Handler when a key is pressed with the line tool selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Line
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

/**
 * Scribble tool that can be used for drawing continuous lines that
 * do not have to be straight.
 * 
 * @class Scribble
 * @extends {Tool}
 */
class Scribble extends Tool {
    /**
     * Creates an instance of Scribble.
     * 
     * @param {StyleSettings} styleSettings - style settings for the application
     * 
     * @memberOf Scribble
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 10 Q 5 1, 10 10 T 20 10" stroke="black" fill="transparent"/></svg>';
        super("scribble", svg, "~", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event for the scribble tool. This will begin the drawing
     * with the scribble tool.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Scribble
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition);
    }
    
    /**
     * Handler for the mouse move event for the scribble tool. This will continuously draw lines
     * between the previous and current positions of the cursor.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Scribble
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.beginPath();
            context.moveTo(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y);
            context.lineTo(mousePosition.x, mousePosition.y);
            context.stroke();
            this.__lastDrawingPosition = mousePosition;
        }
    }
    
    /**
     * Handler for the mouse up event for the scribble tool. This will stop the drawing and copy the data
     * from the drawing canvas to the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Scribble
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }
    
    /**
     * Handler when a key is pressed when the scribble tool is selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Scribble
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

/**
 * Square tool that can be used for drawing rectangles on the canvas.
 * 
 * @class Square
 * @extends {Tool}
 */
class Square extends Tool {
    /**
     * Creates an instance of Square.
     * 
     * @param {StyleSettings} styleSettings - style settings for the application
     * 
     * @memberOf Square
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><rect x="0" y="0" width="20" height="20" stroke="black" stroke-width="1" fill="none" />';
        super("square", svg, "[]", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event for the square tool. This will start the drawing of a rectangle
     * and this will mark the corner position for the rectangle.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Square
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }
    
    /**
     * Handler for the mouse move event for the square tool. Each time the mouse moves and we are drawing,
     * a new rectangle will be drawn between the original mouse pressed position and the current cursor position.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Square
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            context.beginPath();
            context.rect(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y);
            if (this.__styleSettings.fillColor.color !== "transparent") {
                context.fill();
            }
            context.stroke();
            context.closePath();
        }
    }
    
    /**
     * Handler for the mouse up event for the square. This will stop drawing the rectangle and copy the contents from
     * the drawing canvas to the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Square
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }
    
    /**
     * Handler for the key pressed when square is selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Square
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

/**
 * Circle tool that can be used for drawing ovals on the canvas.
 * 
 * @class Circle
 * @extends {Tool}
 */
class Circle extends Tool {
    /**
     * Creates an instance of Circle.
     * 
     * @param {StyleSettings} styleSettings - style settings for the application
     * 
     * @memberOf Circle
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><circle cx="10" cy="10" r="9" stroke="black" stroke-width="1" fill="none" />';
        super("circle", svg, "o", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event for the circle tool. This will start the drawing of an
     * oval and will mark the corner position where it will start being drawn.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Circle
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }
    
    /**
     * Handler for the mouse move event for the circle tool. When we are drawing, we will redraw the
     * the oval between the starting position and the current cursor position.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Circle
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            this.drawEllipse(context, this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y);
        }
    }
    
    /**
     * Handler for the mouse up event for the circle tool. This will stop the drawing of an oval
     * and save the contents from the drawing canvas to the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Circle
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }
    
    /**
     * Handler for key pressed while the circle tool is selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Circle
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
    
    //================================= 
    // Private methods
    //================================= 
    /**
     * Helper method for drawing an ellipse.
     * 
     * @private
     * @param {CanvasRenderingContext2D} ctx - context for the drawing canvas
     * @param {number} x - x position for the corner of the oval
     * @param {number} y - y position for the corner of the oval
     * @param {number} width - width of the oval
     * @param {number} height - height of the oval
     * 
     * @memberOf Circle
     */
    private drawEllipse(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
        var xRad = width / 2;
        var yRad = height / 2;
        var centerX = x + xRad;
        var centerY = y + yRad;

        ctx.beginPath();
        for (var theta = 0; theta < 2 * Math.PI; theta += 0.01) {
            var xPos = centerX + xRad * Math.cos(theta);
            var yPos = centerY + yRad * Math.sin(theta);

            if (theta === 0) {
                ctx.moveTo(xPos, yPos);
            } else {
                ctx.lineTo(xPos, yPos);
            }
        }
        if (this.__styleSettings.fillColor.color !== "transparent") {
            ctx.fill();
        }
        ctx.stroke();
        ctx.closePath();
    }
}

/**
 * Text tool that can be used for adding text to the canvas.
 * 
 * @class TextTool
 * @extends {Tool}
 */
class TextTool extends Tool {
    //================================= 
    // Private fields
    //================================= 
    private __textElem: HTMLDivElement;

    /**
     * Creates an instance of TextTool.
     * 
     * @param {StyleSettings} styleSettings - style settings for the application
     * 
     * @memberOf TextTool
     */
    constructor(styleSettings: StyleSettings) {
        super("text", "", "T", styleSettings);
    }

    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event for the text tool. If we weren't previously typing,
     * create a new text element to put text into. Otherwise, we transfer the old text element's
     * contents to the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf TextTool
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (!this.__textElem) {
            this.startDrawing(mousePosition, context);
            this.__textElem = document.createElement("div");
            this.__textElem.setAttribute("class", "canvas-textinput");
            this.__textElem.setAttribute("contenteditable", "true");
            this.__textElem.setAttribute("style", "left:" + this.__lastDrawingPosition.x + "px;top:" + this.__lastDrawingPosition.y + "px;font:" + this.__styleSettings.font.size + "px " + this.__styleSettings.font.name + ";");
            document.getElementById("canvas-wrapper").appendChild(this.__textElem);
            var tool = this;
            window.setTimeout(function () {
                tool.__textElem.focus();
            }, 0);
        } else {
            if (this.__textElem) {
                var text = this.__textElem.innerText;
                var width = this.__textElem.clientWidth;
                context.save();
                context.fillStyle = "black";
                context.fillText(text, this.__lastDrawingPosition.x - 3, this.__lastDrawingPosition.y + this.__styleSettings.font.size - 5);
                document.getElementById("canvas-wrapper").removeChild(this.__textElem);
                this.__textElem = null;
                context.restore();
            }

            this.stopDrawing(context, savingContext);
        }
    }

    /**
     * Handler for the mouse move event for the text tool. This event will currently be ignored.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf TextTool
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
    
    /**
     * Handler for the mouse up event for the text tool. This event will currently be ignored.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf TextTool
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
    
    /**
     * Handler for a key press event while the text tool is selected. This event will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf TextTool
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

/**
 * Eraser tool that can be used for removing contents of the canvas.
 * 
 * @class Eraser
 * @extends {Tool}
 */
class Eraser extends Tool {
    /**
     * Creates an instance of Eraser.
     * 
     * @param {StyleSettings} styleSettings - style settings of the application
     * 
     * @memberOf Eraser
     */
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 0 H10 L 20 20 H 10 L 0 0" fill="pink" stroke="black"/></svg>';
        super("eraser", svg, "E", styleSettings);
    }
    
    //=================================
    // Event handler implementations
    //=================================
    /**
     * Handler for the mouse down event of the eraser that will start the process of erasing
     * the canvas.
     * 
     * @param {ZPosition} mousePosition
     * @param {CanvasRenderingContext2D} context
     * @param {CanvasRenderingContext2D} savingContext
     * 
     * @memberOf Eraser
     */
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition);
    }
    
    /**
     * Handler for the mouse move event of the eraser. When drawing, each position will be cleared
     * based on the eraser tool's radius.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Eraser
     */
    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.clearRect(mousePosition.x - this.__styleSettings.pixelWeight*2, mousePosition.y - this.__styleSettings.pixelWeight*2, this.__styleSettings.pixelWeight*2, this.__styleSettings.pixelWeight*2);
        }
    }
    
    /**
     * Handler for the mouse up event of the eraser. This will stop the erasing action and copy the
     * drawing canvas to the saving canvas.
     * 
     * @param {ZPosition} mousePosition - current position of the mouse
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Eraser
     */
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }
    
    /**
     * Handler for the key press event while the eraser is selected. These events will currently be ignored.
     * 
     * @param {KeyboardEvent} event - keyboard event for the key pressed
     * @param {CanvasRenderingContext2D} context - context of the canvas being drawn on
     * @param {CanvasRenderingContext2D} savingContext - context of the canvas being saved to
     * 
     * @memberOf Eraser
     */
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}