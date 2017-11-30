# Asynchronous A-Star pathfinding
Pathfinding algorithm with Synchronous/Asynchronous modes.
Can be switched between A-Star and breadth-first search.

## How to use
To use this library, you must implement 2 Interfaces: 
* ```IAAStarField``` - this is you gamefield, it should be able to:
    * ```getNearNodes(node:IAAStarFieldNode):Array<IAAStarFieldNode>``` - returns Array of nodes, that located near the given one
    * ```heuristicDistance(a:IAAStarFieldNode, b:IAAStarFieldNode):number``` - returns heuristic distance between any two nodes
    (can returrn constant, if you don't want to use heuristic in your algorithm, in this case it's recommended to you to enable ```{ useWideSearch: true }``` option)

* ```IAAStarFieldNode``` - this is a game cell, that gamefield contains of. Every two cells with the same coordinates MUST BE the same object, otherwise ```getNearNodes``` method will be working incorrect. Game cell should be able to return it's own __move cost__ (if cell is not walkable, must return -1)


### Usage example

#### Synchronous method usage with a Simple Game field (```AAStarSimpleField``` Located in ```fields``` folder)

```
let simpleField:AAStarSimpleField = new AAStarSimpleField([
            [1, -1, -1, 1],
            [1, -1,  0, 1],
            [1,  2, -1, 1],
            [1,  1,  1, 1],
        ], false)

        let astar:AAStar = new AAStar(simpleField);
        astar.calculatePath(simpleField.getNodeAt(0,0), simpleField.getNodeAt(3,0))
            .forEach ((v:SimpleNode, i) => {
                console.log(i + "=" + v.x + "," + v.y);
            });
```

#### Asynchronous method usage

```
let options:IAlgorhitmOptions = {cacheResults:true, iterationsPerFrame:10, useWideSearch:true}
aStar.calculatePathAsync(simpleField.getCellAt(0,0), simpleField.getCellAt(3,0), options)
        .then((r) => {
            r.forEach((v:SimpleNode) => {
                console.log(i + "=" + v.x + "," + v.y);
            });
        })
```