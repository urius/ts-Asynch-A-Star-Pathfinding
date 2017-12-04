/**
 * every gamefield cell must have move cost value
 */
export interface IAAStarFieldNode {
    getMoveCost(): number;
}
/**
 * Game field interface
 */
export interface IAAStarField {
    getNearNodes(node: IAAStarFieldNode): Array<IAAStarFieldNode>;
    heuristicDistance(a: IAAStarFieldNode, b: IAAStarFieldNode): number;
}
/**
 * Options for synchronous algorithm mode
 * cacheResults - if true, results will be saved for future use
 * useWideSearch - if true, heuristic will be disabled, result will contain the shortest path,
 * but calculation time will be increased
 */
export interface IAlgorhitmOptions {
    cacheResults?: boolean;
    useWideSearch?: boolean;
}
/**
 * Extended options for asynchronous algorithm mode
 * iterationsPerFrame - how many calculation steps will be maked during the frame (recommended values: 10 - 100)
 */
export interface IAsyncAlgorhitmOptions extends IAlgorhitmOptions {
    iterationsPerFrame?: number;
}
/**
 * Main class
 */
export declare class AAStar {
    private _gameField;
    private _cacheMap;
    private _defaultOptions;
    constructor(gameField: IAAStarField, defaultOptions?: IAsyncAlgorhitmOptions);
    /**
     * Synchronous path calculation, returns Array of IAAStarFieldNodes
     * @param from start point
     * @param to end point
     * @param options algorithm settings (cacheResults:boolean, useWideSearch:boolean)
     */
    calculatePath(from: IAAStarFieldNode, to: IAAStarFieldNode, options?: IAlgorhitmOptions): IAAStarFieldNode[];
    /**
     * Asynchronous path calculation, returns promise whith Array of IAAStarFieldNodes
     * @param from start point
     * @param to end point
     * @param options algorithm settings (cacheResults:boolean, useWideSearch:boolean, iterationsPerFrame:integer)
     */
    calculatePathAsync(from: IAAStarFieldNode, to: IAAStarFieldNode, options?: IAsyncAlgorhitmOptions): Promise<IAAStarFieldNode[]>;
    clearCache(): void;
    private getFromCache(from, to, options);
    private calculateAsynchStep(calculationData, onSuccess, iterationsPerFrame);
    private restorePath(finishNode);
}
