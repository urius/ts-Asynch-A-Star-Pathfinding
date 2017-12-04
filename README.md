# Typescript asynchronous A-Star pathfinding
Pathfinding algorithm with Synchronous/Asynchronous modes.
Can be switched between A-Star and breadth-first search.

## Install

```npm install aastar --save```

## How to use
Import classes and interfaces to your project:

``` import { IAAStarField, IAAStarFieldNode, AAStar, AAStarSimpleField, SimpleNode } from "aastar";```


Create new ```AAStar``` instance and pass your ```game field``` instance as a parameter (you can use one of standard ```game fields``` located in **/fields** folder):

```let aastar:AAStar = new AAStar(gameField, defaultOptions);```

If necessary, you can pass ```options``` to constructor. The options cintains properties:
* **iterationsPerFrame** - how many calculation steps will be maked during the frame (recommended values: 10 - 100). Default: ```10```
* **cacheResults** - if true, results will be saved for future use
* **useWideSearch** - if true, heuristic will be disabled, result will contain the shortest path, but calculation time will be increased

Call ```aastar.calculatePath(startNode, endNode);``` or ```aastar.calculatePathAsynch(startNode, endNode);``` to calculate path in synchronous or asynchronous mode accordingly. In asynchronous mode you will get the ```Promise``` as a result.


## Create custom game field type
If you want to use your own type of game field, you need to implement 2 Interfaces: 
* ```IAAStarField``` - this is your custom game field, it should be able to:
    * ```getNearNodes(node:IAAStarFieldNode):Array<IAAStarFieldNode>``` - returns Array of nodes, that located near the given one
    * ```heuristicDistance(a:IAAStarFieldNode, b:IAAStarFieldNode):number``` - returns heuristic distance between any two nodes
    (can returrn constant, if you don't want to use heuristic in your algorithm, in this case it's recommended to you to enable ```{ useWideSearch: true }``` option)

* ```IAAStarFieldNode``` - this is a game cell, that gamefield contains of. Every two cells with the same coordinates MUST BE the same object, otherwise ```getNearNodes``` method will be working incorrect. 
    * ```getMoveCost()``` - Game cell should be able to return it's own __move cost__ (if cell is not walkable, must return **-1**)


## Examples

### Synchronous method usage with a Simple Game field (```AAStarSimpleField``` Located in ```fields/``` folder)

```
import { IAAStarField, IAAStarFieldNode, AAStar, AAStarSimpleField, SimpleNode } from "aastar";

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

### Asynchronous method usage

```
let options:IAlgorhitmOptions = {cacheResults:true, iterationsPerFrame:10, useWideSearch:true}
aStar.calculatePathAsync(simpleField.getCellAt(0,0), simpleField.getCellAt(3,0), options)
        .then((r) => {
            r.forEach((v:SimpleNode) => {
                console.log(i + "=" + v.x + "," + v.y);
            });
        })
```