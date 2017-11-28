import { IAAStarField, IAAStarFieldNode } from "../AAStar";

export class AAStarSimpleField implements IAAStarField {
    private _map:SimpleNode[][];
    private _useDiagonals:boolean;

    constructor(map:number[][], useDiagonals:boolean = true) {
        this._map = this.convertMap(map);
        this._useDiagonals = useDiagonals;
    }

    private convertMap(map:number[][]):SimpleNode[][] {
        let result:SimpleNode[][] = [];
        for(let y:number = 0; y < map.length; y++) {
            result[y] = [];
            for(let x:number = 0; x < map[y].length; x ++) {
                result[y][x] = new SimpleNode(x, y, map[y][x]);
            }
        }  
        return result;
        
    }

    public getNodeAt(x:number, y:number):SimpleNode {
        if(this._map[y]) {
            return this._map[y][x];
        }
        return null;
    }
    
    public getNearNodes(node:SimpleNode):IAAStarFieldNode[] {
        let result:SimpleNode[] = [];
        //debugger;
        if (node) {
            this.addIfWalkable(this.getNodeAt(node.x - 1, node.y), result);
            this.addIfWalkable(this.getNodeAt(node.x + 1, node.y), result);
            this.addIfWalkable(this.getNodeAt(node.x, node.y - 1), result);
            this.addIfWalkable(this.getNodeAt(node.x, node.y + 1), result);
            if(this._useDiagonals == true) {
                this.addIfWalkable(this.getNodeAt(node.x - 1, node.y - 1), result);
                this.addIfWalkable(this.getNodeAt(node.x - 1, node.y + 1), result);
                this.addIfWalkable(this.getNodeAt(node.x + 1, node.y - 1), result);
                this.addIfWalkable(this.getNodeAt(node.x + 1, node.y + 1), result);
            }
        }
        return result;
    }

    private addIfWalkable(node:SimpleNode, array:SimpleNode[]):void {
        if (node && node.getMoveCost() >= 0) {
            array.push(node);
        }
    }

    public heuristicDistance(a: SimpleNode, b: SimpleNode): number {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    }
}

export class SimpleNode implements IAAStarFieldNode{
    private _moveCost:number;
    private _x:number;
    private _y:number;

    constructor(x:number, y:number, moveCost:number) {
        this._moveCost = moveCost;
        this._x = x;
        this._y = y;
    }

    public getMoveCost():number {
        return this._moveCost;
    }

    public get x():number {
        return this._x;
    }

    public get y():number {
        return this._y;
    }
}