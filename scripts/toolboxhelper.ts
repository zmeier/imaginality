/**
 * Helper class for the toolbox. This class is used to create menus and buttons.
 * 
 * @class ToolboxHelper
 */
class ToolboxHelper {
    private static __menuDiv: HTMLElement;
    
    
    /**
     * Create a style button element for the toolbox. Apply various attributes
     * and styles to this element, as well as, handle the callback for the click
     * event.
     * 
     * @static
     * @param {Toolbox} toolbox - reference to the toolbox to use in the click callback
     * @param {string} elemType - type of element to create
     * @param {string} id - ID of the element
     * @param {*} attributes - list of attributes that consist of a key and value to add to the element
     * @param {string} innerContent - Content to place within the element
     * @param {*} styles - list of styles that consist of a key and value to add to the element
     * @param {*} callback - callback function for when a the click event is triggered for the element
     * @returns {HTMLElement} - newly created button element
     * 
     * @memberOf ToolboxHelper
     */
    public static createStyleButton(toolbox: Toolbox, elemType: string, id: string, attributes: any, innerContent: string, styles: any, callback: any): HTMLElement {
        var key: string;
        var styleButton = document.createElement(elemType);
        styleButton.setAttribute("id", id);
        for (key in attributes) {
            var attr = attributes[key] as string;
            styleButton.setAttribute(key, attr);
        }
        styleButton.innerHTML = innerContent;
        for (key in styles) {
            var style = styles[key] as string;
            styleButton.style.setProperty(key, style);
        }

        if (callback) {
            styleButton.addEventListener("click", function (event) {
                callback(event, toolbox, id);
            }, false);
        }

        return styleButton;
    }

    /**
     * Create a menu out of a list of items.
     * 
     * @private
     * @static
     * @param {any[]} menu - list of items with the attributes of class, callback, and html for the item
     * @param {number} x - x position to show the menu
     * @param {number} y - y position to show the menu
     * 
     * @memberOf ToolboxHelper
     */
    private static createMenu(menu: any[], x: number, y: number): void {
        var focusItem: HTMLElement;
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
    }
    
    /**
     * Close the currently open menu, which is being stored in the __menuDiv
     * static reference.
     * 
     * @static
     * 
     * @memberOf ToolboxHelper
     */
    public static closeMenu(): void {
        if (ToolboxHelper.__menuDiv) {
            document.body.removeChild(ToolboxHelper.__menuDiv);
            ToolboxHelper.__menuDiv = null;
        }
    }

    /**
     * Create a menu that will allow the user to choose the stroke of the line tool.
     * 
     * @static
     * @param {Event} evt - unused event from the click event of the stroke select button
     * @param {Toolbox} box - reference to toolbox to add callbacks to
     * @param {string} id - id of the stroke menu
     * 
     * @memberOf ToolboxHelper
     */
    public static createStrokeMenu(evt: Event, box: Toolbox, id: string): void {
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

        var rect = document.getElementById(id).getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    }

    /**
     * Create a menu that will allow the user to choose the pixel of the draw tool.
     * 
     * @static
     * @param {Event} evt - unused event from the click event of the weight select button
     * @param {Toolbox} box - reference to toolbox to add callbacks to
     * @param {string} id - id of the weight menu
     * 
     * @memberOf ToolboxHelper
     */
    public static createPixelWeightMenu(evt: Event, box: Toolbox, id: string): void {
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

        var rect = document.getElementById(id).getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    }

     /**
     * Create a menu that will allow the user to choose the font of the text tool.
     * 
     * @static
     * @param {Event} evt - unused event from the click event of the font select button
     * @param {Toolbox} box - reference to toolbox to add callbacks to
     * @param {string} id - id of the font menu
     * 
     * @memberOf ToolboxHelper
     */
    public static createFontMenu(evt: Event, box: Toolbox, id: string): void {
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
        var rect = document.getElementById(id).getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    }

    /**
     * Create a menu that will allow the user to choose the font size of the text tool.
     * 
     * @static
     * @param {Event} evt - unused event from the click event of the font size select button
     * @param {Toolbox} box - reference to toolbox to add callbacks to
     * @param {string} id - id of the font size menu
     * 
     * @memberOf ToolboxHelper
     */
    public static createFontSizeMenu(evt: Event, box: Toolbox, id: string): void {
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
        var rect = document.getElementById(id).getBoundingClientRect();
        ToolboxHelper.createMenu(menu, rect.left, rect.bottom);
    }
}