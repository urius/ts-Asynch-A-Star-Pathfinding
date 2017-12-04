"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AAStarSimpleField {
    constructor(map, useDiagonals = true) {
        this._map = this.convertMap(map);
        this._useDiagonals = useDiagonals;
    }
    convertMap(map) {
        let result = [];
        for (let y = 0; y < map.length; y++) {
            result[y] = [];
            for (let x = 0; x < map[y].length; x++) {
                result[y][x] = new SimpleNode(x, y, map[y][x]);
            }
        }
        return result;
    }
    getNodeAt(x, y) {
        if (this._map[y]) {
            return this._map[y][x];
        }
        return null;
    }
    getNearNodes(node) {
        let result = [];
        //debugger;
        if (node) {
            this.addIfWalkable(this.getNodeAt(node.x - 1, node.y), result);
            this.addIfWalkable(this.getNodeAt(node.x + 1, node.y), result);
            this.addIfWalkable(this.getNodeAt(node.x, node.y - 1), result);
            this.addIfWalkable(this.getNodeAt(node.x, node.y + 1), result);
            if (this._useDiagonals == true) {
                this.addIfWalkable(this.getNodeAt(node.x - 1, node.y - 1), result);
                this.addIfWalkable(this.getNodeAt(node.x - 1, node.y + 1), result);
                this.addIfWalkable(this.getNodeAt(node.x + 1, node.y - 1), result);
                this.addIfWalkable(this.getNodeAt(node.x + 1, node.y + 1), result);
            }
        }
        return result;
    }
    addIfWalkable(node, array) {
        if (node && node.getMoveCost() >= 0) {
            array.push(node);
        }
    }
    heuristicDistance(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}
exports.AAStarSimpleField = AAStarSimpleField;
class SimpleNode {
    constructor(x, y, moveCost) {
        this._moveCost = moveCost;
        this._x = x;
        this._y = y;
    }
    getMoveCost() {
        return this._moveCost;
    }
    get x() {
        return this._x;
    }
    get y() {
        return this._y;
    }
}
exports.SimpleNode = SimpleNode;
//# sourceMappingURL=AAStarSimpleField.js.map