import React from 'react';
import ReactDOM from 'react-dom';
import * as method_utils from './method-utils.jsx';
import MethodSearch from './method-search.jsx'
import MethodPicker from './method-picker.jsx'

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;


class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentBell: 8,
            currentPlace : 8,
            bells: 8,
            siril: "&-58-14.58-58.36.14-14.58-14-18,+18",
            methodName: "Bristol Surprise Major",
            currentPos: 1,
            correct: true,
            userNextPlace: -1,
            errors: 0,
            recentMethods: []
        };
        this.upPlace = this.upPlace.bind(this);
        this.downPlace = this.downPlace.bind(this);
        this.makePlace = this.makePlace.bind(this);
        this.reset = this.reset.bind(this);
        this.newSiril = this.newSiril.bind(this);
        this.newBells = this.newBells.bind(this);
        this.newWorkingBell = this.newWorkingBell.bind(this);
        this.onCorrect = this.onCorrect.bind(this);
        this.onWrong = this.onWrong.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.setPlace = this.setPlace.bind(this);
        this.newMethod = this.newMethod.bind(this);
    }
    componentWillMount() {
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    handleKeyUp(e) {
        if(e.keyCode === KEY_LEFT) {
            this.downPlace(e);
        } else if (e.keyCode === KEY_RIGHT) {
            this.upPlace(e);
        } else if (e.keyCode === KEY_DOWN) {
            this.makePlace(e);
        }
    }

    upPlace(e) {
        if(this.state.currentPlace < this.state.bells) {
            this.setState({
                currentPos: this.state.currentPos + 1,
                userNextPlace: this.state.currentPlace + 1
            })
        }
    }

    downPlace(e) {
        if(this.state.currentPlace > 1) {
            this.setState({
                currentPos: this.state.currentPos + 1,
                userNextPlace: this.state.currentPlace - 1
            })
        }
    }

    makePlace(e) {
        this.setState({
            currentPos: this.state.currentPos + 1,
            userNextPlace: this.state.currentPlace
        })
    }

    reset(e) {
        this.setState({
            currentPlace: this.state.currentBell,
            currentPos: 1,
            errors: 0,
            correct: true,
            userNextPlace: -1
        })
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

    onCorrect() {
        this.setState({correct: true})
    }
    onWrong() {
        this.setState({
            correct: false,
            errors: this.state.errors + 1
        })
    }
    setPlace(e) {
        //console.log(`Setting next place to ${e.place}, user predicted ${this.state.userNextPlace}`);
        this.setState({currentPlace: e.place});
        if(e.place === this.state.userNextPlace || this.state.userNextPlace === -1) {
            this.onCorrect()
        } else {
            this.onWrong()
        }
    }
    newMethod(m) {
        let newRecentMethods = this.state.recentMethods;
        if(newRecentMethods.filter(e => e.id === m.id).length === 0) {
            newRecentMethods.push(m);
        }
        this.setState({
            recentMethods: newRecentMethods,
            siril : m.notation,
            methodName : m.name,
            bells: m.method_set.stage,
            currentPos: 1,
            userNextPlace: -1,
            currentBell: this.state.currentBell > m.method_set.stage ? m.method_set.stage : this.state.currentBell
        })
    }
    render() {
        let bells = this.state.bells;
        let siril = this.state.siril;
        let notation;
        let correct;
        if(this.state.currentPos === 1) {
            correct = <h2>Make a choice</h2>
        } else if (this.state.correct) {
            correct = <h2>Yes!</h2>
        } else {
            correct = <h2>No :(</h2>
        }

        try {
            notation = method_utils.methodFromNotation(siril, bells);
        } catch (e) {
            notation = [];
        }

        return <div>
            <h1>Ringing : {this.state.currentBell} to {this.state.methodName}</h1>
            <div>{correct}</div>
            <div>{this.state.errors} errors.</div>
            <MethodSearch onSuggestionSelected={this.newMethod}/>
            <MethodPicker methods={this.state.recentMethods} />

            <p>{this.state.siril}</p>
            Ringing: <select onChange={this.newWorkingBell} value={this.state.currentBell}>
                {[... new Array(bells).keys()].map(r => <option key={r + 1} value={(r + 1)}>{r + 1}</option>)}
            </select>
            <button onClick={this.reset}>Reset</button>

            <SVGMethod currentPos={this.state.currentPos}
                       notation={notation}
                       bells={bells}
                       currentBell={this.state.currentBell.toString()}
                       lastAction={this.state.lastAction}
                       onNewPlace={this.setPlace}
                       wasCorrect={this.state.correct}
            />
        </div>
    }
}

class SVGMethod extends React.Component {

    render() {
        let rounds = [];
        for (const i of new Array(this.props.bells).keys()) {
            rounds.push(method_utils.inverse_place_map[i + 1]);
        }
        let row = rounds;
        let rows = [];
        for (const note of this.props.notation) {
            rows.push(row);
            row = method_utils.applyPlace(note, row);
        }
        rows.push(rounds);

        let visibleRows = 20;
        let cp = this.props.currentPos;
        {
            rows.map((r, i) => {
                return <Row currentPos={cp} line={r} pos={i + 1} key={i}/>;
            })
        }
        return <div style={{overflow: scroll, height: "500px"}}>
            <svg height="400">
                {[... new Array(this.props.bells).keys()].map(
                    (r) => <line key={r} x1={5 + 20 * r} x2={5 + 20 * r} y1="390" y2="10" stroke="lightgrey"/>)}

                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell="1" stroke="#f00"/>
                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell={this.props.currentBell}
                          stroke="#00f"
                          onNewPlace={this.props.onNewPlace}
                />
            </svg>
        </div>
    }
}

function diff(l, initial) {
    /* Convert a list of numbers to a list of differences */
    let outArray = l.slice();
    let last = initial;
    for(let i = 0; i < outArray.length; i++) {
        outArray[i] = l[i] - last;
        last = l[i];
    }
    return outArray;
}

class BellPath extends React.Component {
    currentBell() {
        return method_utils.inverse_place_map[this.props.bell]
    }
    placeAtRow(p) {
        return this.props.rows[p - 1].indexOf(this.currentBell())
    }
    currentPlace() {
        return this.placeAtRow(this.props.currentPos)
    }
    nextPlace() {
        return this.placeAtRow(this.props.currentPos + 1)
    }
    nextAction() {
        return this.nextPlace() - this.currentPlace()
    }
    // currentPos, showRows, bell, stroke
    componentWillReceiveProps(nextProps) {
        if (this.props.onNewPlace !== undefined) {
            if (nextProps.currentPos > 1) { // Think this should be nextprops
                if (nextProps.currentPos < nextProps.rows.length) {
                    if (nextProps.currentPos !== this.props.currentPos || nextProps.bell !== this.props.bell) {
                        nextProps.onNewPlace({
                            place: nextProps.rows[nextProps.currentPos - 1].indexOf(method_utils.inverse_place_map[nextProps.bell]) + 1
                        })
                    }
                }
            }
        }
    }
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
        let currentPos = this.props.currentPos;
        if(currentPos >= this.props.rows.length) {
            currentPos = this.props.rows.length;
        }

        let firstRowToShow = Math.max(0, currentPos - this.props.showRows);
        let rows = this.props.rows.slice(firstRowToShow, currentPos);

        let path = diff(rows.map(r => r.indexOf(this.currentBell())), 0)
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
    