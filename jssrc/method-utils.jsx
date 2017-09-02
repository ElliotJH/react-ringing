const place_map = {
    "1": 1,
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "0": 10,
    "E": 11,
    "T": 12,
};

export const inverse_place_map = {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "0",
    11: "E",
    12: "T",
};

export function makePlaces(places, N) {
    let stack = [];
    let out = [];
    for (let i = 0; i < N; i++) {
        if (places.includes(i)) {
            while (stack.length) {
                out.push(stack.pop())
            }
            out.push(i);
        } else {
            stack.push(i);
            if (stack.length === 2) {
                out.push(stack[1]);
                out.push(stack[0]);
                stack.length = 0
            }
        }
    }
    while (stack.length) {
        out.push(stack.pop())
    }
    return out;
}

export function applyPlace(place, row) {
    let places = place.split('').map(a => place_map[a] - 1);
    return makePlaces(places, row.length).map(i => row[i])
}

function expandSirilChunk(x) {
    let chunk = [];
    for (const c of x) {
        if (c in place_map) {
            if (chunk.length === 0) {
                chunk.push("")
            }
            chunk.push(chunk.pop() + c)
        } else if (['x', 'X', '-'].indexOf(c) > -1) {
            if (chunk.length === 0) {
                chunk.push("")
            }
            let last = chunk.pop();
            if (last !== "") {
                chunk.push(last)
            }
            chunk.push("x");
            chunk.push("")
        } else if (['&', '+'].indexOf(c) > -1) {
            chunk.push(c);
            chunk.push("")
        } else if (chunk[chunk.length - 1] !== "") {
            chunk.push("")
        } else {
            console.log("Chunk is " + chunk[chunk.length - 1] + " and got " + c);
            throw "Siril Error"
        }
    }

    if (chunk[0] === '+') {
        return chunk.slice(1)
    } else if (chunk[0] === '&') {
        let c = chunk.slice(1);
        return c.concat(c.slice().reverse().slice(1)) // reflect the method
    } else {
        return chunk // Heuristics needed here.
    }
}

function microSirilToNotation(microsiril) {
    let chunks = microsiril.split(",");
    let expandedChunks = chunks.map(expandSirilChunk);
    return expandedChunks.reduce((l, r) => l.concat(r))
}

function fullMethod(notation, leads) {
    let n = [];
    for (let i = 1; i < leads; i++) {
        n = n.concat(notation)
    }
    return n
}

export function methodFromNotation(siril, bells) {
    return fullMethod(microSirilToNotation(siril), bells);
}