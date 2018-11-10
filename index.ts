type Terrain = Array<Array<Cell>>;

type Cell = "w" | ".";

const toCell: {[key: string]: Cell} = {
    '.': '.',
    'w': 'w'
}

const t101 = terrain`
.w.
...
`;

const t201 = terrain`
........
.....w..
.wwwww..
...w....
.....w..
..w..w..
`;

function parseTerrain(s: string): Terrain {
    const lines = s.trim().split('\n');
    return lines.map(l => l.split('').map(c => {
	const cell = toCell[c];
	if (!cell) {
	    throw Error(`Invalid cell: '${c}'`);
	}
	return cell;
    }));
}

function terrain(strings: TemplateStringsArray) {
    if (strings.length > 1) {
	throw new Error('Boom!');
    }
    return parseTerrain(strings[0]);
}

function terrainToString(terrain: Terrain) {
    return terrain.map(line => line.join("")).join("\n");
}

function resultToString(result: Result) {
    const isInPath = new Set(result.path.map(coordinatesKey));

    function lineToString(line: Array<Cell>, y: number) {
	return line.map((cell, x) => isInPath.has(coordinatesKey({x, y})) ? "█" : cell).join("");
    }
    
    return result.terrain.map(lineToString).join("\n");
}

function coordinatesKey({x, y}: Coord) {
    return `${x}-${y}`;
}
    

interface Coord {
    x: number;
    y: number;
}

type Path = Array<Coord>;

interface Result {
    path: Path;
    terrain: Terrain;
}

console.log('Terrain:')
console.log(terrainToString(t101));

function neighbours(terrain: Terrain, x: number, y: number) {
    const minY = y === 0 ? 0 : y - 1;
    const maxY = y === terrain.length - 1 ? y : y + 1;
    const minX = x === 0 ? 0 : x - 1;
    const maxX = x === terrain[0].length - 1 ? x : x + 1;
    const ns = [];
    for (let yy = minY; yy <= maxY; yy++) {
	for (let xx = minX; xx <= maxX; xx++) {
	    if (xx !== x || yy !== y) {
		const cell = terrain[yy][xx];
		if (cell === '.') {
		    ns.push({x: xx, y: yy});
		}
	    }
	}
    }
    
    return ns;
}

function bellmanFord(terrain: Terrain, start: Coord) {
    const distance: {[key: string]: number} = {};
    const predecessor: {[key: string]: Coord | null} = {};

    terrain.forEach((line, y) => line.forEach((cell, x) => {
	distance[coordinatesKey({x, y})] = Infinity;
	predecessor[coordinatesKey({x, y})] = null;
    }));

    distance[coordinatesKey(start)] = 0;
    
    terrain.forEach(line => line.forEach(() => {
	terrain.forEach((line, y) => line.forEach((cell, x) => {
	    const ns = neighbours(terrain, x, y);
	    ns.forEach(neighbour => {
		const {x:nx,y:ny} = neighbour;
		const dx = x - nx;
		const dy = y - ny;
		const d = dx*dx+dy*dy;
		if (distance[coordinatesKey({x, y})] + d < distance[coordinatesKey(neighbour)]) {
		    distance[coordinatesKey(neighbour)] = distance[coordinatesKey({x, y})] + d;
		    predecessor[coordinatesKey(neighbour)] = {x, y};
		}
	    })
	}))
    }));
    return predecessor;
}

type Coordish = Coord | null;

function route(predecessor: {[key: string]: Coord | null}, end: Coord) {
    let current: Coordish = end;
    const path = [];
    while (current !== null) {
	path.push(current);
	current = predecessor[coordinatesKey(current)];
    }
    return path.reverse();
}

const r: Result = {
    path: [{x:0,y:0},{x:1,y:1},{x:2,y:0}],
    terrain: t101
};

console.log('Result:')
console.log(resultToString(r));
console.log('NS', neighbours(t101, 1, 1));
// const predecessors = bellmanFord(t201, {x: 4, y: 1});
// console.log('BF', predecessors);
const r2: Result = {
    path: route(bellmanFord(t201, {x: 4, y: 1}), {x: 7, y: 5}),
    terrain: t201
};
console.log(resultToString(r2));
