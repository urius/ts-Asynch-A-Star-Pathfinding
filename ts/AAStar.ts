/**
 * every gamefield cell must have move cost value
 */
export interface IAAStarFieldNode {
    getMoveCost():number
}
/**
 * Game field interface
 */
export interface IAAStarField {
    getNearNodes(node:IAAStarFieldNode):Array<IAAStarFieldNode>,    
    heuristicDistance(a:IAAStarFieldNode, b:IAAStarFieldNode):number
}
/**
 * Options for synchronous algorithm mode
 * cacheResults - if true, results will be saved for future use
 * useWideSearch - if true, heuristic will be disabled, result will contain the shortest path, 
 * but calculation time will be increased
 */
export interface IAlgorhitmOptions {
    cacheResults?:boolean,
    useWideSearch?:boolean,
}
/**
 * Extended options for asynchronous algorithm mode
 * iterationsPerFrame - how many calculation steps will be maked during the frame (recommended values: 10 - 100)
 */
export interface IAsyncAlgorhitmOptions extends IAlgorhitmOptions {
    iterationsPerFrame?:number
}

/**
 * Main class
 */
export class AAStar {
    private _gameField:IAAStarField;
    private _cacheMap:Map<IAAStarFieldNode, CalculationData> = new Map();
    private _defaultOptions:IAsyncAlgorhitmOptions;

    constructor(gameField:IAAStarField, defaultOptions:IAsyncAlgorhitmOptions = null) {
        this._gameField = gameField;
        this._defaultOptions = defaultOptions || {
                                                    cacheResults: false,
                                                    useWideSearch: false,
                                                    iterationsPerFrame:10
                                                    };
    }

    /**
     * Synchronous path calculation, returns Array of IAAStarFieldNodes
     * @param from start point
     * @param to end point
     * @param options algorithm settings (cacheResults:boolean, useWideSearch:boolean)
     */
    public calculatePath(from:IAAStarFieldNode, to:IAAStarFieldNode, options:IAlgorhitmOptions = null):IAAStarFieldNode[] {
        let calculationOptions:IAlgorhitmOptions = options || this._defaultOptions;
        let cachedPatch:IAAStarFieldNode[] = this.getFromCache(from, to, calculationOptions);
        if (cachedPatch) {
            return cachedPatch;
        }
        let calculationData:CalculationData = new CalculationData(this._gameField, from, to, calculationOptions);
        if (calculationOptions.cacheResults == true){
            this._cacheMap.set(from, calculationData);
        }

        while (true) {
            if (calculationData.calculationStep() == true){
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
    public calculatePathAsync(from:IAAStarFieldNode, to:IAAStarFieldNode,  options:IAsyncAlgorhitmOptions = null):Promise<IAAStarFieldNode[]> {
        let calculationOptions:IAlgorhitmOptions = options || this._defaultOptions;
        let cachedPatch:IAAStarFieldNode[] = this.getFromCache(from, to, calculationOptions);
        if (cachedPatch) {
            return new Promise<IAAStarFieldNode[]> ((resolve) => {
                setTimeout(resolve, 0, cachedPatch);// to save asynchronous behaviour
            });;
        }

        let calculationData:CalculationData = new CalculationData(this._gameField, from, to, calculationOptions);
        if (calculationOptions.cacheResults == true){
            this._cacheMap.set(from, calculationData);
        }
        
        return new Promise<IAAStarFieldNode[]> ((resolve) => {
            this.calculateAsynchStep(calculationData, resolve, options ? options.iterationsPerFrame : 1);
        });
    }

    public clearCache():void {
        this._cacheMap.clear();
    }

    private getFromCache(from:IAAStarFieldNode, to:IAAStarFieldNode, options:IAlgorhitmOptions):IAAStarFieldNode[] {
        let calcData:CalculationData = this._cacheMap.get(from);

        if (calcData) {
            if (Boolean(options.useWideSearch) == Boolean(calcData.options.useWideSearch)) {
                let nodeData:NodeData = calcData.getNodeData(to);
                if (nodeData.previousNode != null || nodeData.isFinishNode == true) {
                    console.log("restoring from cache");
                    return this.restorePath(nodeData); 
                }
            }
        }
        return null;
    }
    

    private calculateAsynchStep(calculationData:CalculationData, onSuccess:(result:IAAStarFieldNode[]) => void, iterationsPerFrame:number):void {
        for (let i:number = 0; i < iterationsPerFrame; i++) {
            if (calculationData.calculationStep() == true){
                onSuccess(this.restorePath(calculationData.to));
                return;
            }
        }
        requestAnimationFrame(() => {
            this.calculateAsynchStep(calculationData, onSuccess, iterationsPerFrame);
        });
    }

    private restorePath(finishNode:NodeData):IAAStarFieldNode[] {
        let result:IAAStarFieldNode[] = [];
        let tempNode:NodeData = finishNode;
        if(finishNode.previousNode != null) {
            result.push(finishNode.node);
            while(tempNode.isStarthNode != true) {
                tempNode = tempNode.previousNode;
                result.unshift(tempNode.node);
            }
        }
        return result;
    }
}

enum FindingStrategy {
    HEURISTIC,
    WIDE
}

class CalculationData {
    private _nodeDataMap:Map<IAAStarFieldNode, NodeData>;
    private _openList:NodeData[];
    private _gameField:IAAStarField;
    private _from:NodeData;
    private _to:NodeData;
    public currentNode:NodeData;
    private _options:IAlgorhitmOptions;    

    private _stepsNum:number = 0;

    private _getNextNodeMethod:() => NodeData;

    constructor(gameField:IAAStarField, from:IAAStarFieldNode, to:IAAStarFieldNode, options:IAlgorhitmOptions) {
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

    public calculationStep = ():boolean => {
        this._stepsNum ++;

        this.addToClosedList(this.currentNode);

        if (this.currentNode.isFinishNode == true) {
            //result = this.restorePath(this.currentNode);
            this._openList.length = 0;
            console.log ("patch was found, steps: " + this._stepsNum);
            return true;
        }

        let nearCells:IAAStarFieldNode[] = this._gameField.getNearNodes(this.currentNode.node);
        if (nearCells) {
            nearCells.forEach ((v) => {
                let moveCost:number = v.getMoveCost();
                if (moveCost >= 0) {
                    let nodeData:NodeData = this.getNodeData(v);
                    this.addToOpenList(nodeData);
                    let g:number = this.currentNode.g + moveCost;
                    if((nodeData.g <= 0 || g < nodeData.g) && nodeData.isStarthNode == false) {
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
    }

    private pickCheapestNode = ():NodeData => {
        let result:NodeData = this._openList[0];
        let finishNode:IAAStarFieldNode = this._to.node;

        let minF:number = result.g + this._gameField.heuristicDistance(result.node, finishNode);
        let tempF:number = 0;
        this._openList.forEach((v) => {
            tempF = v.g + this._gameField.heuristicDistance(v.node, finishNode);
            if(tempF < minF) {
                minF = tempF;
                result = v;
            }
        })
        return result;
    }

    private pickFirstNode = ():NodeData => {
        return this._openList.shift();
    }

    public getNodeData = (node:IAAStarFieldNode):NodeData => {
        let result:NodeData = this._nodeDataMap.get(node);
        if(result == null){
            result = new NodeData(node);
            this.nodeDataMap.set(node, result);
        }
        return result;
    }

    public addToOpenList = (node:NodeData):void => {
        if(node && node.isInClosedList == false && this._openList.indexOf(node) == -1) {
            this._openList.push(node);
        }
    }

    public addToClosedList = (node:NodeData):void => {
        node.isInClosedList = true;
        let nodeIndex:number = this.openList.indexOf(node);
        if(nodeIndex != -1) {
            this._openList.splice(this.openList.indexOf(node), 1);
        }
    }

    public get from():NodeData {
        return this._from;
    }

    public get to():NodeData {
        return this._to;
    }
    
    public get nodeDataMap():Map<IAAStarFieldNode, NodeData> {
        return this._nodeDataMap;
    }

    public get openList():NodeData[] {
        return this._openList;
    }

    public get options():IAlgorhitmOptions {
        return this._options;
    }
}


class NodeData {
    private _node:IAAStarFieldNode;
    public g:number = 0;
    public isInClosedList:boolean = false;
    public isStarthNode:boolean = false;
    public isFinishNode:boolean = false;
    public previousNode:NodeData = null;

    constructor(node:IAAStarFieldNode) {
        this._node = node;
    }
    public get node():IAAStarFieldNode {
        return this._node;
    }
}
