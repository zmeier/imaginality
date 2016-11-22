/// <reference path="toolbox.ts" />

function clearCanvas(context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

abstract class Tool {
    // Private properties
    protected __isDrawing: boolean;
    protected __lastDrawingPosition?: ZPosition;
    protected __tempImageData: ImageData;
    protected __isDirty: boolean;
    protected __styleSettings: StyleSettings;
    // Public get-only properties
    private __name: string;
    private __svgicon: string;
    private __altText: string;

    constructor(name: string, svgIcon: string, altText: string, styleSettings: StyleSettings) {
        this.__name = name;
        this.__svgicon = svgIcon;
        this.__altText = altText;
        this.__styleSettings = styleSettings;
    }

    public get name(): string {
        return this.__name;
    }

    public get svgIcon(): string {
        return this.__svgicon;
    }

    public get altText(): string {
        return this.__altText;
    }

    public toolSelected(): void {
        this.__isDrawing = false;
    }

    // Protected utility methods
    public startDrawing(mousePosition: ZPosition, context?: CanvasRenderingContext2D): void {
        this.__isDirty = true;
        this.__isDrawing = true;
        this.__lastDrawingPosition = mousePosition;

        if (context) {
            this.__tempImageData = getContextImgData(context);
        }
    }

    public stopDrawing(context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.copyContextToSave(context, savingContext);
        this.__isDrawing = false;
        this.__lastDrawingPosition = null;
    }

    // Drawing helper methods
    private copyContextToSave(context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        var imgData: ImageData = getContextImgData(context);
        clearCanvas(savingContext);
        savingContext.putImageData(imgData, 0, 0);
        this.__tempImageData = null;
        this.__isDirty = false;
    }

    // Abstract methods
    abstract mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
    abstract keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void;
}

class Cursor extends Tool {
    private __selectedRect?: ZRect;
    private __isDragging?: boolean;
    private __dragData?: ImageData;

    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M5 2 V 16 L 8 12 L 11 19 L 13 18 L 10 11 L 15.5 11.5 L 5 2" fill="transparent" stroke="black"/></svg>';
        super("cursor", svg, "Mouse", styleSettings);
    }

    public toolSelected(): void {
        super.toolSelected();
        this.__selectedRect = null;
        this.__isDragging = false;
    }

    public startDrawing(mousePosition: ZPosition, context?: CanvasRenderingContext2D): void {
        if (context && this.__isDirty && this.__tempImageData) {
            this.__selectedRect = null;
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
        }
        super.startDrawing(mousePosition, context);
    }

    // Event handler implementations
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

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDragging) {
            context.putImageData(this.__tempImageData, 0, 0);
            this.__selectedRect.pos.x += (mousePosition.x - this.__lastDrawingPosition.x);
            this.__selectedRect.pos.y += (mousePosition.y - this.__lastDrawingPosition.y);
            context.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
            this.__lastDrawingPosition = mousePosition;
        } else if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            context.beginPath();
            context.rect(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y);
            var coords = this.getCoordinates({ pos: { x: this.__lastDrawingPosition.x, y: this.__lastDrawingPosition.y }, width: mousePosition.x - this.__lastDrawingPosition.x, height: mousePosition.y - this.__lastDrawingPosition.y });
            if (!this.__selectedRect) {
                this.__selectedRect = { pos: { x: null, y: null }, width: null, height: null };
            }

            this.__selectedRect.pos.x = coords.left;
            this.__selectedRect.pos.y = coords.top;
            this.__selectedRect.width = coords.right - coords.left;
            this.__selectedRect.height = coords.bottom - coords.top;
            context.stroke();
            context.closePath();
        }
    }

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
        }

        this.__isDrawing = false;
        this.__lastDrawingPosition = null;
        context.restore();
        this.__isDragging = false;
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__selectedRect && event.key === "Delete") {
            context.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            savingContext.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            this.__tempImageData = getContextImgData(savingContext);
        }
    }

    // Private methods
    private clickedInRect(mousePosition: ZPosition, rect: ZRect): boolean {
        var coords = this.getCoordinates(rect);

        if ((mousePosition.x >= coords.left && mousePosition.x <= coords.right) && (mousePosition.y >= coords.top && mousePosition.y <= coords.bottom)) {
            return true;
        }

        return false;
    }

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
}

class Pencil extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M3 5 L 8 2 L 15 13 L 15 19 L 10 16 L 3 5 M 4 7.5 L 10 4" fill="transparent" stroke="black"/></svg>';
        super("pencil", svg, ".", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
        context.beginPath();
        context.fillStyle = context.strokeStyle;
        context.arc(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
        context.fill();
    }

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.beginPath();
            context.arc(mousePosition.x, mousePosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
            context.fill();
            this.__lastDrawingPosition = mousePosition;
        }
    }

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        context.restore();
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

class Line extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg height="20" width="20"><line x1="0" y1="0" x2="20" y2="20" style="stroke:black;stroke-width:1" /></svg>';
        super("line", svg, "/", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }

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

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

class Scribble extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 10 Q 5 1, 10 10 T 20 10" stroke="black" fill="transparent"/></svg>';
        super("scribble", svg, "~", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition);
    }

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.beginPath();
            context.moveTo(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y);
            context.lineTo(mousePosition.x, mousePosition.y);
            context.stroke();
            this.__lastDrawingPosition = mousePosition;
        }
    }

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

class Square extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><rect x="0" y="0" width="20" height="20" stroke="black" stroke-width="1" fill="none" />';
        super("square", svg, "[]", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }

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

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

class Circle extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><circle cx="10" cy="10" r="9" stroke="black" stroke-width="1" fill="none" />';
        super("circle", svg, "o", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition, context);
    }

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            this.drawEllipse(context, this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y);
        }
    }

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }

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

class TextTool extends Tool {
    private __textElem: HTMLDivElement;

    constructor(styleSettings: StyleSettings) {
        super("text", "", "T", styleSettings);
    }

    // Event handler implementations
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

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}

class Eraser extends Tool {
    constructor(styleSettings: StyleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 0 H10 L 20 20 H 10 L 0 0" fill="pink" stroke="black"/></svg>';
        super("eraser", svg, "E", styleSettings);
    }

    // Event handler implementations
    public mouseDown(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.startDrawing(mousePosition);
    }

    public mouseMove(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        if (this.__isDrawing) {
            context.clearRect(mousePosition.x - this.__styleSettings.pixelWeight*2, mousePosition.y - this.__styleSettings.pixelWeight*2, this.__styleSettings.pixelWeight*2, this.__styleSettings.pixelWeight*2);
        }
    }

    public mouseUp(mousePosition: ZPosition, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void {
        this.stopDrawing(context, savingContext);
    }

    public keyPress(event: KeyboardEvent, context: CanvasRenderingContext2D, savingContext: CanvasRenderingContext2D): void { }
}