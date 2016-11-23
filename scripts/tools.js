var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function clearCanvas(context) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}
var Tool = (function () {
    function Tool(name, svgIcon, altText, styleSettings) {
        this.__name = name;
        this.__svgicon = svgIcon;
        this.__altText = altText;
        this.__styleSettings = styleSettings;
    }
    Object.defineProperty(Tool.prototype, "name", {
        get: function () {
            return this.__name;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tool.prototype, "svgIcon", {
        get: function () {
            return this.__svgicon;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tool.prototype, "altText", {
        get: function () {
            return this.__altText;
        },
        enumerable: true,
        configurable: true
    });
    Tool.prototype.toolSelected = function () {
        this.__isDrawing = false;
    };
    Tool.prototype.startDrawing = function (mousePosition, context) {
        this.__isDirty = true;
        this.__isDrawing = true;
        this.__lastDrawingPosition = mousePosition;
        if (context) {
            this.__tempImageData = getContextImgData(context);
        }
    };
    Tool.prototype.stopDrawing = function (context, savingContext) {
        this.copyContextToSave(context, savingContext);
        this.__isDrawing = false;
        this.__lastDrawingPosition = null;
    };
    Tool.prototype.copyContextToSave = function (context, savingContext) {
        var imgData = getContextImgData(context);
        clearCanvas(savingContext);
        savingContext.putImageData(imgData, 0, 0);
        this.__tempImageData = null;
        this.__isDirty = false;
    };
    return Tool;
}());
var Cursor = (function (_super) {
    __extends(Cursor, _super);
    function Cursor(styleSettings) {
        var svg = '<svg width="20" height="20"><path d="M5 2 V 16 L 8 12 L 11 19 L 13 18 L 10 11 L 15.5 11.5 L 5 2" fill="transparent" stroke="black"/></svg>';
        _super.call(this, "cursor", svg, "Mouse", styleSettings);
    }
    Cursor.prototype.toolSelected = function () {
        _super.prototype.toolSelected.call(this);
        this.__selectedRect = null;
        this.__isDragging = false;
    };
    Cursor.prototype.startDrawing = function (mousePosition, context) {
        if (context && this.__isDirty && this.__tempImageData) {
            this.__selectedRect = null;
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
        }
        _super.prototype.startDrawing.call(this, mousePosition, context);
    };
    Cursor.prototype.stopDrawing = function (context, savingContext) {
        clearCanvas(context);
        _super.prototype.stopDrawing.call(this, context, savingContext);
    };
    Cursor.prototype.mouseDown = function (mousePosition, context, savingContext) {
        if (this.__selectedRect && this.clickedInRect(mousePosition, this.__selectedRect)) {
            this.__isDragging = true;
            this.__lastDrawingPosition = mousePosition;
            this.__dragData = savingContext.getImageData(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            savingContext.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            this.__tempImageData = savingContext.getImageData(0, 0, context.canvas.width, context.canvas.height);
            context.putImageData(this.__tempImageData, 0, 0);
            context.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
        }
        else {
            this.startDrawing(mousePosition, context);
            this.__isDragging = false;
            context.save();
            context.setLineDash([5, 5]);
            context.strokeStyle = "black";
            context.lineWidth = 1;
        }
    };
    Cursor.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDragging) {
            context.putImageData(this.__tempImageData, 0, 0);
            this.__selectedRect.pos.x += (mousePosition.x - this.__lastDrawingPosition.x);
            this.__selectedRect.pos.y += (mousePosition.y - this.__lastDrawingPosition.y);
            context.putImageData(this.__dragData, this.__selectedRect.pos.x, this.__selectedRect.pos.y);
            this.__lastDrawingPosition = mousePosition;
        }
        else if (this.__isDrawing) {
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
    };
    Cursor.prototype.mouseUp = function (mousePosition, context, savingContext) {
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
    };
    Cursor.prototype.keyPress = function (event, context, savingContext) {
        if (this.__selectedRect && event.key === "Delete") {
            context.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            savingContext.clearRect(this.__selectedRect.pos.x, this.__selectedRect.pos.y, this.__selectedRect.width, this.__selectedRect.height);
            this.__tempImageData = getContextImgData(savingContext);
        }
    };
    Cursor.prototype.clickedInRect = function (mousePosition, rect) {
        var coords = this.getCoordinates(rect);
        if ((mousePosition.x >= coords.left && mousePosition.x <= coords.right) && (mousePosition.y >= coords.top && mousePosition.y <= coords.bottom)) {
            return true;
        }
        return false;
    };
    Cursor.prototype.getCoordinates = function (rect) {
        var left, right, top, bottom;
        if (rect.width < 0) {
            left = rect.pos.x + rect.width;
            right = rect.pos.x;
        }
        else {
            left = rect.pos.x;
            right = rect.pos.x + rect.width;
        }
        if (rect.height < 0) {
            top = rect.pos.y + rect.height;
            bottom = rect.pos.y;
        }
        else {
            top = rect.pos.y;
            bottom = rect.pos.y + rect.height;
        }
        return { left: left, right: right, top: top, bottom: bottom };
    };
    return Cursor;
}(Tool));
var Pencil = (function (_super) {
    __extends(Pencil, _super);
    function Pencil(styleSettings) {
        var svg = '<svg width="20" height="20"><path d="M3 5 L 8 2 L 15 13 L 15 19 L 10 16 L 3 5 M 4 7.5 L 10 4" fill="transparent" stroke="black"/></svg>';
        _super.call(this, "pencil", svg, ".", styleSettings);
    }
    Pencil.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition, context);
        context.beginPath();
        context.fillStyle = context.strokeStyle;
        context.arc(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
        context.fill();
    };
    Pencil.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDrawing) {
            context.beginPath();
            context.arc(mousePosition.x, mousePosition.y, this.__styleSettings.pixelWeight, 0, 2 * Math.PI);
            context.fill();
            this.__lastDrawingPosition = mousePosition;
        }
    };
    Pencil.prototype.mouseUp = function (mousePosition, context, savingContext) {
        context.restore();
        this.stopDrawing(context, savingContext);
    };
    Pencil.prototype.keyPress = function (event, context, savingContext) { };
    return Pencil;
}(Tool));
var Line = (function (_super) {
    __extends(Line, _super);
    function Line(styleSettings) {
        var svg = '<svg height="20" width="20"><line x1="0" y1="0" x2="20" y2="20" style="stroke:black;stroke-width:1" /></svg>';
        _super.call(this, "line", svg, "/", styleSettings);
    }
    Line.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition, context);
    };
    Line.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            context.beginPath();
            context.moveTo(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y);
            context.lineTo(mousePosition.x, mousePosition.y);
            context.stroke();
            context.closePath();
        }
    };
    Line.prototype.mouseUp = function (mousePosition, context, savingContext) {
        this.stopDrawing(context, savingContext);
    };
    Line.prototype.keyPress = function (event, context, savingContext) { };
    return Line;
}(Tool));
var Scribble = (function (_super) {
    __extends(Scribble, _super);
    function Scribble(styleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 10 Q 5 1, 10 10 T 20 10" stroke="black" fill="transparent"/></svg>';
        _super.call(this, "scribble", svg, "~", styleSettings);
    }
    Scribble.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition);
    };
    Scribble.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDrawing) {
            context.beginPath();
            context.moveTo(this.__lastDrawingPosition.x, this.__lastDrawingPosition.y);
            context.lineTo(mousePosition.x, mousePosition.y);
            context.stroke();
            this.__lastDrawingPosition = mousePosition;
        }
    };
    Scribble.prototype.mouseUp = function (mousePosition, context, savingContext) {
        this.stopDrawing(context, savingContext);
    };
    Scribble.prototype.keyPress = function (event, context, savingContext) { };
    return Scribble;
}(Tool));
var Square = (function (_super) {
    __extends(Square, _super);
    function Square(styleSettings) {
        var svg = '<svg width="20" height="20"><rect x="0" y="0" width="20" height="20" stroke="black" stroke-width="1" fill="none" />';
        _super.call(this, "square", svg, "[]", styleSettings);
    }
    Square.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition, context);
    };
    Square.prototype.mouseMove = function (mousePosition, context, savingContext) {
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
    };
    Square.prototype.mouseUp = function (mousePosition, context, savingContext) {
        this.stopDrawing(context, savingContext);
    };
    Square.prototype.keyPress = function (event, context, savingContext) { };
    return Square;
}(Tool));
var Circle = (function (_super) {
    __extends(Circle, _super);
    function Circle(styleSettings) {
        var svg = '<svg width="20" height="20"><circle cx="10" cy="10" r="9" stroke="black" stroke-width="1" fill="none" />';
        _super.call(this, "circle", svg, "o", styleSettings);
    }
    Circle.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition, context);
    };
    Circle.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDrawing) {
            clearCanvas(context);
            context.putImageData(this.__tempImageData, 0, 0);
            this.drawEllipse(context, this.__lastDrawingPosition.x, this.__lastDrawingPosition.y, mousePosition.x - this.__lastDrawingPosition.x, mousePosition.y - this.__lastDrawingPosition.y);
        }
    };
    Circle.prototype.mouseUp = function (mousePosition, context, savingContext) {
        this.stopDrawing(context, savingContext);
    };
    Circle.prototype.keyPress = function (event, context, savingContext) { };
    Circle.prototype.drawEllipse = function (ctx, x, y, width, height) {
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
            }
            else {
                ctx.lineTo(xPos, yPos);
            }
        }
        if (this.__styleSettings.fillColor.color !== "transparent") {
            ctx.fill();
        }
        ctx.stroke();
        ctx.closePath();
    };
    return Circle;
}(Tool));
var TextTool = (function (_super) {
    __extends(TextTool, _super);
    function TextTool(styleSettings) {
        _super.call(this, "text", "", "T", styleSettings);
    }
    TextTool.prototype.mouseDown = function (mousePosition, context, savingContext) {
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
        }
        else {
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
    };
    TextTool.prototype.mouseMove = function (mousePosition, context, savingContext) { };
    TextTool.prototype.mouseUp = function (mousePosition, context, savingContext) { };
    TextTool.prototype.keyPress = function (event, context, savingContext) { };
    return TextTool;
}(Tool));
var Eraser = (function (_super) {
    __extends(Eraser, _super);
    function Eraser(styleSettings) {
        var svg = '<svg width="20" height="20"><path d="M0 0 H10 L 20 20 H 10 L 0 0" fill="pink" stroke="black"/></svg>';
        _super.call(this, "eraser", svg, "E", styleSettings);
    }
    Eraser.prototype.mouseDown = function (mousePosition, context, savingContext) {
        this.startDrawing(mousePosition);
    };
    Eraser.prototype.mouseMove = function (mousePosition, context, savingContext) {
        if (this.__isDrawing) {
            context.clearRect(mousePosition.x - this.__styleSettings.pixelWeight * 2, mousePosition.y - this.__styleSettings.pixelWeight * 2, this.__styleSettings.pixelWeight * 2, this.__styleSettings.pixelWeight * 2);
        }
    };
    Eraser.prototype.mouseUp = function (mousePosition, context, savingContext) {
        this.stopDrawing(context, savingContext);
    };
    Eraser.prototype.keyPress = function (event, context, savingContext) { };
    return Eraser;
}(Tool));
//# sourceMappingURL=tools.js.map