import React from 'react';
import ReactDOM from 'react-dom';
import * as method_utils from './method-utils.jsx';
import MethodSearch from './method-search.jsx'
import MethodPicker from './method-picker.jsx'
import SVGMethod from './svg-method.jsx'

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const localStorage = window.localStorage;

function loadFromStore() {
    let resp =  {
        recentMethods : JSON.parse(localStorage.getItem("recentMethods"))  || []
    };
    console.log(resp);
    return resp;
}
function saveToStore(d) {
    console.log("Saving");
    for (let property in d) {
        if (d.hasOwnProperty(property)) {
            localStorage.setItem(property, JSON.stringify(d[property]))
        }
    }
}

/**
 * The root component for the site, probably not easily reusable.
 */
class Main extends React.Component {

    constructor(props) {
        super(props);
        let storedState = loadFromStore();
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
            recentMethods: storedState.recentMethods
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

    componentWillUpdate(prevProps, prevState) {
        saveToStore({recentMethods: this.state.recentMethods})
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

        return <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">
                    Method Practice Tool
                </a>
                <span>Ringing the <select onChange={this.newWorkingBell} value={this.state.currentBell}>
                        {[... new Array(bells).keys()].map(r => <option key={r + 1} value={(r + 1)}>{r + 1}</option>)}
                    </select> to {this.state.methodName}</span>
                <form className="form-inline ml-auto">
                    <button className="btn ml-sm-2" onClick={this.reset}>Reset</button>
                </form>

            </nav>
            <div className="row">
                <div className="col-md-3">
                    <MethodSearch onSuggestionSelected={this.newMethod}/>
                    <br />
                    <MethodPicker methods={this.state.recentMethods} />
                </div>
                <div className="col-md-6">

                    <SVGMethod currentPos={this.state.currentPos}
                               notation={notation}
                               bells={bells}
                               currentBell={this.state.currentBell.toString()}
                               lastAction={this.state.lastAction}
                               onNewPlace={this.setPlace}
                               wasCorrect={this.state.correct}
                    />
                </div>
                <div className="col-md-3">
                    <div>{this.state.errors} errors.</div>
                </div>
            </div>
        </div>
    }
}
ReactDOM.render(<Main/>, document.getElementById('react-root-container'));
