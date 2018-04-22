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

/**
 * Continually pop from source and push to sink until source is empty.
 * @param {Array} source - array to be emptied
 * @param {Array} sink - array to be filled
 */
function emptyArraytoArray(source, sink) {
    while (source.length) {
        sink.push(source.pop());
    }
}

/**
 * Applies array based places to a row of rounds to give a "transform"
 * row, being the indices that each entry in a row should be moved to.
 * @param {int[]} places - the bells which should stay constant.
 * @param {int} N - the number of bells in a row.
 * @returns {Array} - the transform row.
 */
export function makePlaces(places, N) {
    let stack = []; // Bells that are yet to be placed
    let out = []; // The row that will be returned
    for (let i = 0; i < N; i++) { // Iterate through teh row
        if (places.includes(i)) {
            emptyArraytoArray(stack, out);
            out.push(i); // Now make the place
        } else {
            stack.push(i); // Add this bell to the stack
            if (stack.length === 2) { // If we have two entries, swap them.
                out.push(stack[1]);
                out.push(stack[0]);
                stack.length = 0
            }
        }
    }
    emptyArraytoArray(stack, out);
    return out;
}

/**
 * Convert a place string to a place array
 * @param {string} place - the string describing this place
 * @returns {int[]} - the bells which should stay constant
 */
function placeStringToArray(place) {
    return place.split('').map(a => place_map[a] - 1);
}

/**
 * Applies a string place to a row.
 * @param {string} place - the place to apply
 * @param {int[]} row - the row to apply the place to
 * @returns {int[]} - the transformed row
 */
export function applyPlace(place, row) {
    let places = placeStringToArray(place);
    return makePlaces(places, row.length).map(i => row[i])
}

function expandSirilChunk(sirilChunk) {
    let chunk = [];
    for (const c of sirilChunk) {
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