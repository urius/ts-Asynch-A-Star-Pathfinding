"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main class
 */
class AAStar {
    constructor(gameField, defaultOptions = null) {
        this._cacheMap = new Map();
        this._gameField = gameField;
        this._defaultOptions = defaultOptions || {
            cacheResults: false,
            useWideSearch: false,
            iterationsPerFrame: 10
        };
    }
    /**
     * Synchronous path calculation, returns Array of IAAStarFieldNodes
     * @param from start point
     * @param to end point
     * @param options algorithm settings (cacheResults:boolean, useWideSearch:boolean)
     */
    calculatePath(from, to, options = null) {
        let calculationOptions = options || this._defaultOptions;
        let cachedPatch = this.getFromCache(from, to, calculationOptions);
        if (cachedPatch) {
            return cachedPatch;
        }
        let calculationData = new CalculationData(this._gameField, from, to, calculationOptions);
        if (calculationOptions.cacheResults == true) {
            this._cacheMap.set(from, calculationData);
        }
        while (true) {
            if (calculationData.calculationStep() == true) {
                return this.restorePath(calculationData.to);
            }
        }
    }
    /**
     * Asynchronous path calculation, returns promise whith Array of IAAStarFieldNodes
     * @param from start point
     * @param to end point
     * @param options algorithm settings (cacheResults:boolean, useWideSearch:boolean, iterationsPerFrame:integer)
     */
    calculatePathAsync(from, to, options = null) {
        let calculationOptions = options || this._defaultOptions;
        let cachedPatch = this.getFromCache(from, to, calculationOptions);
        if (cachedPatch) {
            return new Promise((resolve) => {
                setTimeout(resolve, 0, cachedPatch); // to save asynchronous behaviour
            });
            ;
        }
        let calculationData = new CalculationData(this._gameField, from, to, calculationOptions);
        if (calculationOptions.cacheResults == true) {
            this._cacheMap.set(from, calculationData);
        }
        return new Promise((resolve) => {
            this.calculateAsynchStep(calculationData, resolve, options ? options.iterationsPerFrame : 1);
        });
    }
    clearCache() {
        this._cacheMap.clear();
    }
    getFromCache(from, to, options) {
        let calcData = this._cacheMap.get(from);
        if (calcData) {
            if (Boolean(options.useWideSearch) == Boolean(calcData.options.useWideSearch)) {
                let nodeData = calcData.getNodeData(to);
                if (nodeData.previousNode != null || nodeData.isFinishNode == true) {
                    console.log("restoring from cache");
                    return this.restorePath(nodeData);
                }
            }
        }
        return null;
    }
    calculateAsynchStep(calculationData, onSuccess, iterationsPerFrame) {
        for (let i = 0; i < iterationsPerFrame; i++) {
            if (calculationData.calculationStep() == true) {
                onSuccess(this.restorePath(calculationData.to));
                return;
            }
        }
        requestAnimationFrame(() => {
            this.calculateAsynchStep(calculationData, onSuccess, iterationsPerFrame);
        });
    }
    restorePath(finishNode) {
        let result = [];
        let tempNode = finishNode;
        if (finishNode.previousNode != null) {
            result.push(finishNode.node);
            while (tempNode.isStarthNode != true) {
                tempNode = tempNode.previousNode;
                result.unshift(tempNode.node);
            }
        }
        return result;
    }
}
exports.AAStar = AAStar;
var FindingStrategy;
(function (FindingStrategy) {
    FindingStrategy[FindingStrategy["HEURISTIC"] = 0] = "HEURISTIC";
    FindingStrategy[FindingStrategy["WIDE"] = 1] = "WIDE";
})(FindingStrategy || (FindingStrategy = {}));
class CalculationData {
    constructor(gameField, from, to, options) {
        this._stepsNum = 0;
        this.calculationStep = () => {
            this._stepsNum++;
            this.addToClosedList(this.currentNode);
            if (this.currentNode.isFinishNode == true) {
                //result = this.restorePath(this.currentNode);
                this._openList.length = 0;
                console.log("patch was found, steps: " + this._stepsNum);
                return true;
            }
            let nearCells = this._gameField.getNearNodes(this.currentNode.node);
            if (nearCells) {
                nearCells.forEach((v) => {
                    let moveCost = v.getMoveCost();
                    if (moveCost >= 0) {
                        let nodeData = this.getNodeData(v);
                        this.addToOpenList(nodeData);
                        let g = this.currentNode.g + moveCost;
                        if ((nodeData.g <= 0 || g < nodeData.g) && nodeData.isStarthNode == false) {
                            nodeData.g = g;
                            nodeData.previousNode = this.currentNode;
                        }
                    }
                });
            }
            if (this._openList.length == 0) {
                console.log("Patch not found, steps:" + this._stepsNum);
                return true;
            }
            this.currentNode = this._getNextNodeMethod();
            return false;
        };
        this.pickCheapestNode = () => {
            let result = this._openList[0];
            let finishNode = this._to.node;
            let minF = result.g + this._gameField.heuristicDistance(result.node, finishNode);
            let tempF = 0;
            this._openList.forEach((v) => {
                tempF = v.g + this._gameField.heuristicDistance(v.node, finishNode);
                if (tempF < minF) {
                    minF = tempF;
                    result = v;
                }
            });
            return result;
        };
        this.pickFirstNode = () => {
            return this._openList.shift();
        };
        this.getNodeData = (node) => {
            let result = this._nodeDataMap.get(node);
            if (result == null) {
                result = new NodeData(node);
                this.nodeDataMap.set(node, result);
            }
            return result;
        };
        this.addToOpenList = (node) => {
            if (node && node.isInClosedList == false && this._openList.indexOf(node) == -1) {
                this._openList.push(node);
            }
        };
        this.addToClosedList = (node) => {
            node.isInClosedList = true;
            let nodeIndex = this.openList.indexOf(node);
            if (nodeIndex != -1) {
                this._openList.splice(this.openList.indexOf(node), 1);
            }
        };
        this._gameField = gameField;
        this._nodeDataMap = new Map();
        this._openList = [];
        this._from = this.getNodeData(from);
        this._from.isStarthNode = true;
        this._to = this.getNodeData(to);
        this._to.isFinishNode = true;
        this.currentNode = this._from;
        this._options = options;
        this._getNextNodeMethod = this._options.useWideSearch ? this.pickFirstNode : this.pickCheapestNode;
        this._stepsNum = 0;
    }
    get from() {
        return this._from;
    }
    get to() {
        return this._to;
    }
    get nodeDataMap() {
        return this._nodeDataMap;
    }
    get openList() {
        return this._openList;
    }
    get options() {
        return this._options;
    }
}
class NodeData {
    constructor(node) {
        this.g = 0;
        this.isInClosedList = false;
        this.isStarthNode = false;
        this.isFinishNode = false;
        this.previousNode = null;
        this._node = node;
    }
    get node() {
        return this._node;
    }
}
//# sourceMappingURL=AAStar.js.map