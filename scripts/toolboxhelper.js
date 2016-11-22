var ToolboxHelper = (function () {
    function ToolboxHelper() {
    }
    ToolboxHelper.createStyleButton = function (toolbox, elemType, id, attributes, innerContent, styles, callback) {
        var key;
        var styleButton = document.createElement(elemType);
        styleButton.setAttribute("id", id);
        for (key in attributes) {
            var attr = attributes[key];
            styleButton.setAttribute(key, attr);
        }
        styleButton.innerHTML = innerContent;
        for (key in styles) {
            var style = styles[key];
            styleButton.style.setProperty(key, style);
        }
        if (callback) {
            styleButton.addEventListener("click", function (event) {
                callback(event, toolbox);
            }, false);
        }
        return styleButton;
    };
    ToolboxHelper.createMenu = function (menu, x, y) {
        var focusItem;
        ToolboxHelper.closeMenu();
        ToolboxHelper.__menuDiv = document.createElement("div");
        ToolboxHelper.__menuDiv.setAttribute("class", "dropdown-menu");
        ToolboxHelper.__menuDiv.setAttribute("style", "left:" + x + "px;top:" + y + "px;");
        ToolboxHelper.__menuDiv.setAttribute("tabindex", "0");
        for (var i = 0; i < menu.length; i++) {
            var menuItem = menu[i];
            var itemDiv = document.createElement("div");
            itemDiv.innerHTML = menuItem.html;
            itemDiv.setAttribute("class", menuItem.class);
            itemDiv.addEventListener('click', menuItem.callback, false);
            itemDiv.addEventListener('keypress', menuItem.callback, false);
            itemDiv.setAttribute("tabindex", "0");
            ToolboxHelper.__menuDiv.appendChild(itemDiv);
            if (i === 0) {
                focusItem = itemDiv;
            }
        }
        window.setTimeout(function () {
            focusItem.focus();
        }, 0);
        document.body.appendChild(ToolboxHelper.__menuDiv);
    };
    ToolboxHelper.closeMenu = function () {
        if (ToolboxHelper.__menuDiv) {
            document.body.removeChild(ToolboxHelper.__menuDiv);
            ToolboxHelper.__menuDiv = null;
        }
    };
    ToolboxHelper.createStrokeMenu = function (evt, box) {
        var menu = [{
                html: '<svg height="20" width="50"><line x1="2" y1="10" x2="48" y2="10" style="stroke:black;stroke-width:2" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changeStroke(2, box);
                }
            },
            {
                html: '<svg height="20" width="50"><line x1="2" y1="10" x2="48" y2="10" style="stroke:black;stroke-width:4" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changeStroke(4, box);
                }
            },
            {
                html: '<svg height="20" width="50"><line x1="2" y1="10" x2="48" y2="10" style="stroke:black;stroke-width:6" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changeStroke(6, box);
                }
            },
            {
                html: '<svg height="20" width="50"><line x1="2" y1="10" x2="48" y2="10" style="stroke:black;stroke-width:8" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changeStroke(8, box);
                }
            },
            {
                html: '<svg height="20" width="50"><line x1="2" y1="10" x2="48" y2="10" style="stroke:black;stroke-width:10" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changeStroke(10, box);
                }
            },
        ];
        var rect = document.getElementById("toolboxStylebutton_strokeWeight").getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    };
    ToolboxHelper.createPixelWeightMenu = function (evt, box) {
        var menu = [{
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="1" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(1, box);
                }
            },
            {
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="2" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(2, box);
                }
            },
            {
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="4" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(4, box);
                }
            },
            {
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="6" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(6, box);
                }
            },
            {
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="8" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(8, box);
                }
            },
            {
                html: '<svg height="20" width="20"><circle cx="10" cy="10" r="10" style="fill:black;" /></svg>',
                class: "dropdown-button",
                callback: function () {
                    box.changePixelWeight(10, box);
                }
            },
        ];
        var rect = document.getElementById("toolboxStylebutton_pixelWeight").getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    };
    ToolboxHelper.createFontMenu = function (evt, box) {
        var menu = [{
                html: '<div style="font-family:Arial">Arial</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("arial", box);
                }
            },
            {
                html: '<div style="font-family:Arial Black">Arial Black</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("arial black", box);
                }
            },
            {
                html: '<div style="font-family:Comic Sans MS">Comic Sans MS</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("comic sans ms", box);
                }
            },
            {
                html: '<div style="font-family:Tahoma">Tahoma</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("Tahoma", box);
                }
            },
            {
                html: '<div style="font-family:Courier New">Courier New</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("Courier New", box);
                }
            },
            {
                html: '<div style="font-family:Lucida Console">Lucida Console</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFont("Lucida Console", box);
                }
            },
        ];
        var rect = document.getElementById("toolboxStylebutton_font").getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    };
    ToolboxHelper.createFontSizeMenu = function (evt, box) {
        var menu = [{
                html: '<div style="font-size:12px">12</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("12", box);
                }
            },
            {
                html: '<div style="font-size:16px">16</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("16", box);
                }
            },
            {
                html: '<div style="font-size:20px">20</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("20", box);
                }
            },
            {
                html: '<div style="font-size:24px">24</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("24", box);
                }
            },
            {
                html: '<div style="font-size:28px">28</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("28", box);
                }
            },
            {
                html: '<div style="font-size:32px">32</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("32", box);
                }
            },
            {
                html: '<div style="font-size:36px">36</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("36", box);
                }
            },
            {
                html: '<div style="font-size:40px">40</div>',
                class: "dropdown-button",
                callback: function () {
                    box.changeFontSize("40", box);
                }
            },
        ];
        var rect = document.getElementById("toolboxStylebutton_fontSize").getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    };
    return ToolboxHelper;
}());
//# sourceMappingURL=toolboxhelper.js.map