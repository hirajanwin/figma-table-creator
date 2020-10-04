var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function changeText(node, text) {
    return __awaiter(this, void 0, void 0, function* () {
        yield figma.loadFontAsync({ family: "Roboto", style: "Regular" });
        node.characters = text;
        node.textAutoResize = "HEIGHT";
        // Fixes issue where spaces are ignored and node has zero width
        node.resize(10, node.height);
        node.layoutAlign = "STRETCH";
    });
}
function cloneComponentAsFrame(component) {
    var frame = figma.createFrame();
    frame.name = component.name;
    frame.fills = component.fills;
    frame.strokes = component.strokes;
    frame.strokeWeight = component.strokeWeight;
    frame.strokeStyleId = component.strokeStyleId;
    frame.strokeAlign = component.strokeAlign;
    frame.strokeCap = component.strokeCap;
    frame.strokeJoin = component.strokeJoin;
    frame.strokeMiterLimit = component.strokeMiterLimit;
    frame.topLeftRadius = component.topLeftRadius;
    frame.topRightRadius = component.topRightRadius;
    frame.bottomLeftRadius = component.bottomLeftRadius;
    frame.bottomRightRadius = component.bottomRightRadius;
    frame.layoutMode = component.layoutMode;
    frame.counterAxisSizingMode = component.counterAxisSizingMode;
    for (let i = 0; i < component.children.length; i++) {
        frame.appendChild(component.children[i].clone());
    }
    return frame;
}
function createBorder() {
    var frame1 = figma.createComponent();
    var line1 = figma.createLine();
    // frame1.resizeWithoutConstraints(0.01, 0.01)
    frame1.name = "Table Border";
    line1.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.clipsContent = false;
    line1.resizeWithoutConstraints(10000, 0);
    const strokes = clone(line1.strokes);
    strokes[0].color.r = 0.725490196078431;
    strokes[0].color.g = 0.725490196078431;
    strokes[0].color.b = 0.725490196078431;
    line1.strokes = strokes;
    frame1.appendChild(line1);
    return frame1;
}
function createCell(topBorder, leftBorder) {
    var cell = figma.createComponent();
    var frame1 = figma.createFrame();
    var frame2 = figma.createFrame();
    var line1 = topBorder;
    var line2 = leftBorder;
    var text = figma.createText();
    frame2.name = "Content";
    // text.layoutAlign = "STRETCH"
    changeText(text, "");
    cell.name = "Table/Cell/Default";
    const fills = clone(cell.fills);
    fills[0].opacity = 0.0001;
    fills[0].visible = true;
    cell.fills = fills;
    frame2.layoutMode = "VERTICAL";
    frame1.appendChild(line1);
    frame1.appendChild(line2);
    frame1.locked = true;
    frame1.fills = [];
    frame2.fills = [];
    line1.rotation = -90;
    line2.rotation = 180;
    line2.x = 100;
    line2.constraints = {
        horizontal: "STRETCH",
        vertical: "STRETCH"
    };
    frame1.resizeWithoutConstraints(100, 0.01);
    frame1.clipsContent = false;
    frame1.layoutAlign = "STRETCH";
    frame2.layoutAlign = "STRETCH";
    frame2.horizontalPadding = 8;
    frame2.verticalPadding = 10;
    cell.layoutMode = "VERTICAL";
    cell.appendChild(frame1);
    cell.appendChild(frame2);
    frame2.appendChild(text);
    return cell;
}
// function createCellHeader() {
// 	var cell = figma.createComponent()
// 	cell.name = "Table/Cell/Header"
// 	return cell
// }
function createRow() {
    var row = figma.createComponent();
    row.name = "Table/Row";
    row.clipsContent = true;
    return row;
}
function createTable() {
    var table = figma.createComponent();
    table.name = "Table";
    const strokes = clone(table.strokes);
    const paint = {
        type: "SOLID",
        color: {
            r: 0.725490196078431,
            g: 0.725490196078431,
            b: 0.725490196078431
        }
    };
    strokes[0] = paint;
    table.strokes = strokes;
    table.cornerRadius = 2;
    table.clipsContent = true;
    const fills = clone(table.fills);
    fills[0].visible = true;
    table.fills = fills;
    // table.strokeWeight = 1
    return table;
}
var components = {};
function createComponents() {
    var page = figma.createPage();
    page.name = "Table Creator";
    var border = createBorder();
    page.appendChild(border);
    components.cell = createCell(border.createInstance(), border.createInstance());
    page.appendChild(components.cell);
    components.cellHeader = figma.createComponent();
    var innerCell = components.cell.createInstance();
    innerCell.layoutAlign = "STRETCH";
    components.cellHeader.appendChild(innerCell);
    components.cellHeader.name = "Table/Cell/Header";
    components.cellHeader.layoutMode = "VERTICAL";
    const fills = clone(components.cellHeader.fills);
    fills[0].opacity = 0.05;
    fills[0].color.r = 0;
    fills[0].color.b = 0;
    fills[0].color.g = 0;
    fills[0].visible = true;
    components.cellHeader.fills = fills;
    page.appendChild(components.cellHeader);
    components.row = createRow();
    components.row.appendChild(components.cell.createInstance());
    components.row.appendChild(components.cell.createInstance());
    components.row.layoutMode = "HORIZONTAL";
    components.row.counterAxisSizingMode = "AUTO";
    page.appendChild(components.row);
    components.table = createTable();
    components.table.appendChild(cloneComponentAsFrame(components.row));
    components.table.appendChild(cloneComponentAsFrame(components.row));
    components.table.layoutMode = "VERTICAL";
    components.table.counterAxisSizingMode = "AUTO";
    page.appendChild(components.table);
}
var cellID;
function findTableCell() {
    var pages = figma.root.children;
    var regex = /\b(cell|td|cell\/default|td\/default)$/gmi;
    var cell;
    for (let i = 0; i < pages.length; i++) {
        cell = pages[i].findOne(node => regex.test(node.name) && node.type === "COMPONENT");
    }
    return cell || false;
}
function findTable() {
    var pages = figma.root.children;
    var regex = /\b(table)$/gmi;
    var table;
    for (let i = 0; i < pages.length; i++) {
        table = pages[i].findOne(node => regex.test(node.name) && node.type === "COMPONENT");
    }
    var newTable;
    if (table) {
        newTable = figma.createFrame();
        newTable.fills = table.fills;
        newTable.strokes = table.strokes;
        newTable.strokeWeight = table.strokeWeight;
        newTable.strokeStyleId = table.strokeStyleId;
        newTable.strokeAlign = table.strokeAlign;
        newTable.strokeCap = table.strokeCap;
        newTable.strokeJoin = table.strokeJoin;
        newTable.strokeMiterLimit = table.strokeMiterLimit;
        newTable.topLeftRadius = table.topLeftRadius;
        newTable.topRightRadius = table.topRightRadius;
        newTable.bottomLeftRadius = table.bottomLeftRadius;
        newTable.bottomRightRadius = table.bottomRightRadius;
        newTable.name = "Table";
    }
    // if (table) {
    // 	if (table.children) {
    // 		for (let i = 0; i < table.children.length; i++) {
    // 			table.children[i].remove()
    // 		}
    // 	}
    // }
    // console.log(table)
    return newTable || false;
}
function findComponentById(id) {
    var pages = figma.root.children;
    var component;
    // Look through each page to see if matches node id
    for (let i = 0; i < pages.length; i++) {
        component = pages[i].findOne(node => node.id === id && node.type === "COMPONENT");
    }
    // Return component if found, otherwise return false
    return component || false;
}
function createNewTable(numberColumns, numberRows, cellWidth, includeHeader) {
    var cell = findComponentById(figma.root.getPluginData("cellComponentID"));
    var cellHeader = findComponentById(figma.root.getPluginData("cellHeaderComponentID"));
    var row = cloneComponentAsFrame(findComponentById(figma.root.getPluginData("rowComponentID")));
    // Remove children (we only need the container)
    for (let i = 0; i < row.children.length; i++) {
        row.children[0].remove();
    }
    row.children[0].remove();
    var table = cloneComponentAsFrame(findComponentById(figma.root.getPluginData("tableComponentID")));
    // Remove children (we only need the container)
    console.log(table.children.length);
    for (let i = 0; i < table.children.length; i++) {
        table.children[0].remove();
    }
    table.children[0].remove();
    if (includeHeader) {
        var rowHeader = row.clone();
        for (var i = 0; i < numberColumns; i++) {
            // Duplicate cell for each column and append to row
            var duplicatedCellHeader = cellHeader.createInstance();
            duplicatedCellHeader.resizeWithoutConstraints(cellWidth, duplicatedCellHeader.height);
            rowHeader.appendChild(duplicatedCellHeader);
        }
        table.appendChild(rowHeader);
        numberRows = numberRows - 1;
    }
    // Duplicate cell for each column and append to row
    for (var i = 0; i < numberColumns; i++) {
        var duplicatedCell = cell.createInstance();
        duplicatedCell.resizeWithoutConstraints(cellWidth, duplicatedCell.height);
        row.appendChild(duplicatedCell);
    }
    // Duplicate row for each row and append to table
    // Easier to append cloned row and then duplicate, than remove later, hence numberRows - 1
    table.appendChild(row);
    for (let i = 0; i < numberRows - 1; i++) {
        var duplicatedRow = row.clone();
        table.appendChild(duplicatedRow);
    }
    return table;
}
function addNewNodeToSelection(page, node) {
    page.selection = node;
}
function selectColumn() {
    var _a;
    // Needs a way to exclude things which aren't rows/columns, or a way to include only rows/columns
    var regex = RegExp(/\[ignore\]/, 'g');
    var selection = figma.currentPage.selection;
    var newSelection = [];
    for (let i = 0; i < selection.length; i++) {
        var parent = (_a = selection[i].parent) === null || _a === void 0 ? void 0 : _a.parent;
        var children = parent === null || parent === void 0 ? void 0 : parent.children;
        var rowIndex = children.findIndex(x => x.id === selection[i].parent.id);
        var columnIndex = children[rowIndex].children.findIndex(x => x.id === selection[i].id);
        for (let i = 0; i < children.length; i++) {
            if (children[i].children) {
                if (children[i].children[columnIndex] && !regex.test(children[i].children[columnIndex].parent.name)) {
                    newSelection.push(clone(children[i].children[columnIndex]));
                }
            }
        }
    }
    addNewNodeToSelection(figma.currentPage, newSelection);
}
var message = {
    componentsExist: false,
    columnCount: parseInt(figma.currentPage.getPluginData("columnCount"), 10) || 4,
    rowCount: parseInt(figma.currentPage.getPluginData("rowCount"), 10) || 4,
    cellWidth: parseInt(figma.currentPage.getPluginData("cellWidth"), 10) || 100,
    remember: true,
    includeHeader: true
};
if (figma.currentPage.getPluginData("remember") == "true")
    message.remember = true;
if (figma.currentPage.getPluginData("remember") == "false")
    message.remember = false;
if (figma.currentPage.getPluginData("includeHeader") == "true")
    message.includeHeader = true;
if (figma.currentPage.getPluginData("includeHeader") == "false")
    message.includeHeader = false;
if (figma.command === "createTable") {
    if (findComponentById(figma.root.getPluginData("cellComponentID"))) {
        message.componentsExist = true;
    }
    figma.showUI(__html__);
    figma.ui.resize(282, 425);
    figma.ui.postMessage(message);
    figma.ui.onmessage = msg => {
        if (msg.type === 'create-components') {
            createComponents();
            figma.root.setPluginData("cellComponentID", components.cell.id);
            figma.root.setPluginData("cellHeaderComponentID", components.cellHeader.id);
            figma.root.setPluginData("rowComponentID", components.row.id);
            figma.root.setPluginData("tableComponentID", components.table.id);
            figma.notify('New page created');
        }
        if (msg.type === 'create-table') {
            if (msg.columnCount < 51 && msg.rowCount < 51) {
                var table = createNewTable(msg.columnCount, msg.rowCount, msg.cellWidth, msg.includeHeader);
                figma.currentPage.setPluginData("columnCount", msg.columnCount.toString());
                figma.currentPage.setPluginData("rowCount", msg.rowCount.toString());
                figma.currentPage.setPluginData("cellWidth", msg.cellWidth.toString());
                figma.currentPage.setPluginData("remember", msg.remember.toString()),
                    figma.currentPage.setPluginData("includeHeader", msg.includeHeader.toString());
                if (figma.currentPage.getPluginData("remember")) {
                    message.remember = (figma.currentPage.getPluginData("remember") == "true");
                }
                if (figma.currentPage.getPluginData("includeHeader")) {
                    message.includeHeader = (figma.currentPage.getPluginData("includeHeader") == "true");
                }
                if (figma.currentPage.getPluginData("columnCount")) {
                    message.columnCount = parseInt(figma.currentPage.getPluginData("columnCount"), 10);
                }
                if (figma.currentPage.getPluginData("rowCount")) {
                    message.rowCount = parseInt(figma.currentPage.getPluginData("rowCount"), 10);
                }
                if (figma.currentPage.getPluginData("cellWidth")) {
                    message.rowCount = parseInt(figma.currentPage.getPluginData("cellWidth"), 10);
                }
                const nodes = [];
                nodes.push(table);
                // Position newly created table in center of viewport
                table.x = figma.viewport.center.x - (table.width / 2);
                table.y = figma.viewport.center.y - (table.height / 2);
                figma.currentPage.selection = nodes;
                figma.viewport.scrollAndZoomIntoView(nodes);
                figma.closePlugin();
            }
            else {
                figma.notify("Plugin limited to max of 50 columns and rows");
            }
        }
    };
}
if (figma.command === "selectColumn") {
    selectColumn();
    figma.closePlugin();
}
