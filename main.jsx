import React from 'react';
import ReactDOM from 'react-dom';
//import Autosuggest from 'react-autosuggest';

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

const inverse_place_map = {
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


function makePlaces(places, N) {
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

function applyPlace(place, row) {
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

class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentBell: 8,
            bells: 8,
            siril: "&x38x14x1258x36x14x58x16x78,+12",
            currentPos: 1,
            lastAction: 0
        };
        this.increase = this.increase.bind(this);
        this.upPlace = this.upPlace.bind(this);
        this.downPlace = this.downPlace.bind(this);
        this.makePlace = this.makePlace.bind(this);
        this.reset = this.reset.bind(this);
        this.newSiril = this.newSiril.bind(this);
        this.newBells = this.newBells.bind(this);
        this.newWorkingBell = this.newWorkingBell.bind(this);
    }

    increase(e) {
        this.setState({currentPos: this.state.currentPos + 1})
    }

    upPlace(e) {
        this.setState({currentPos: this.state.currentPos + 1, lastAction: 1})
    }

    downPlace(e) {
        this.setState({currentPos: this.state.currentPos + 1, lastAction: -1})
    }

    makePlace(e) {
        this.setState({currentPos: this.state.currentPos + 1, lastAction: 0})
    }

    reset(e) {
        this.setState({currentPos: 1})
    }

    newSiril(e) {
        this.setState({siril: e.target.value})
    }

    newBells(e) {
        this.setState({bells: parseInt(e.target.value)})
    }

    newWorkingBell(e) {
        this.setState({currentBell: e.target.value})
    }

    render() {
        let bells = this.state.bells;
        let siril = this.state.siril;
        let notation;
        console.log("Bells: " + bells + " Us " + this.state.currentBell);
        try {
            notation = fullMethod(microSirilToNotation(siril), bells)
        } catch (e) {
            notation = []
        }
        return <div>
            <h1>Ringing</h1>
            <div>
                <p>{this.state.lastAction}</p>
                <button onClick={this.downPlace}>Lower</button>
                <button onClick={this.makePlace}>Make Place</button>
                <button onClick={this.upPlace}>Higher</button>
                <button onClick={this.reset}>Reset</button>
            </div>

            <input value={this.state.siril} size="40" onChange={this.newSiril}/>
            <select onChange={this.newBells} value={bells}>
                {[... new Array(16).keys()].map(r => <option key={r + 1} value={r + 1}>{r + 1}</option>)}
            </select>
            <select onChange={this.newWorkingBell} value={this.state.currentBell}>
                {[... new Array(bells).keys()].map(r => <option key={r + 1} value={(r + 1)}>{r + 1}</option>)}
            </select>
            <SVGMethod currentPos={this.state.currentPos}
                       notation={notation}
                       bells={bells}
                       currentBell={this.state.currentBell.toString()}
                       lastAction={this.state.lastAction}
            />
        </div>
    }
}

class SVGMethod extends React.Component {

    render() {
        let start = [];
        for (const i of new Array(this.props.bells).keys()) {
            start.push(inverse_place_map[i + 1]);
        }

        let rows = [];
        for (const note of this.props.notation) {
            rows.push(start);
            start = applyPlace(note, start);
        }
        let visibleRows = 20;
        let cp = this.props.currentPos;
        {
            rows.map((r, i) => <Row currentPos={cp} line={r} pos={i + 1} key={i}/>)
        }
        return <div style={{overflow: scroll, height: "500px"}}>
            <svg height="400">
                {[... new Array(this.props.bells).keys()].map(
                    (r) => <line key={r} x1={5 + 20 * r} x2={5 + 20 * r} y1="390" y2="10" stroke="lightgrey"/>)}

                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell="1" stroke="#f00"/>
                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell={this.props.currentBell}
                          stroke="#00f"/>
            </svg>
        </div>
    }
}

class BellPath extends React.Component {
    /* BellPath draws an SVG Path tracing the path of a single bell */
    render() {
        const columnWidth = 20, columnPadding = 20;
        /*
            Find the subset of rows we will actually draw (this allows us to work down through the page)

            TODO proper scrolling implemented in SVG.

            firstRowToShow = the smallest numbered row we will draw, non-negative.
            currentPos - showRows = the smallest numbered row we will draw (but might be negative).
            currentPos = how many lines we are through the method
            showRows = number of rows to draw
         */
        let firstRowToShow = Math.max(0, this.props.currentPos - this.props.showRows);
        let rows = this.props.rows.slice(firstRowToShow, this.props.currentPos);

        let path = rows
            .map(r => r.indexOf(inverse_place_map[this.props.bell]))
            // [[a,b], ..., [j]], i -> [[a,b],...,[j, i], [i]]
            .reduce((ls, i) => {
                return ls.slice(0, -1).concat([[ls[ls.length - 1][0], i], [i]]);
            }, [[0]])
            .slice(0, -1) // Remove the trailing [i]
            .map(pair => pair[1] - pair[0]) // Array of differences
            .map(relIndex => [relIndex * columnWidth + "," + columnPadding]);

        if (path.length > 0) {
            return <path d={"M 5,-10 m " + path.join(" l ")} fill="none" stroke={this.props.stroke}
                         strokeWidth="1.5px"/>
        } else {
            return <path/>
        }
    }
}

class Row extends React.Component {
    render() {
        let fontHeight = 20;
        if ((this.props.pos <= this.props.currentPos) &&
            (this.props.pos >= Math.max(0, this.props.currentPos - 10))) {

            let pos = this.props.pos;
            return <g>{this.props.line.map((b, i) => <Bell place={i * fontHeight} height={fontHeight * pos}
                                                           fontSize={fontHeight} bell={b} key={i}/>)}</g>
        } else {
            return <g/>;
        }
    }
}

class Bell extends React.Component {
    render() {
        return <text x={this.props.place} y={this.props.height} fontSize={this.props.fontSize}>{this.props.bell}</text>
    }
}

ReactDOM.render(<Main/>, document.getElementById('react-root-container'));
    
