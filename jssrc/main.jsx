import React from 'react';
import ReactDOM from 'react-dom';
import MethodSearch from './method-search.jsx'
import MethodPicker from './method-picker.jsx'
import SVGMethod from './svg-method.jsx'

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

const localStorage = window.localStorage;

const nullStatus = {
    currentPos: 1,
    currentBell: 8,
    currentPlace: 8,
    correct: true,
    userNextPlace: -1,
    errors: 0
};

function loadFromStore() {
    return {
        recentMethods : new Map(JSON.parse(localStorage.getItem("recentMethods"))  || new Map())
    };
}
function saveToStore(d) {
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
            method: null,
            status: null,
            recentMethods: storedState.recentMethods
        };
        this.upPlace = this.upPlace.bind(this);
        this.downPlace = this.downPlace.bind(this);
        this.makePlace = this.makePlace.bind(this);
        this.reset = this.reset.bind(this);
        this.newWorkingBell = this.newWorkingBell.bind(this);
        this.onCorrect = this.onCorrect.bind(this);
        this.onWrong = this.onWrong.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.setPlace = this.setPlace.bind(this);
        this.newMethod = this.newMethod.bind(this);
        this.removeMethod = this.removeMethod.bind(this);
    }
    componentWillMount() {
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
    }

    componentWillUpdate(prevProps, prevState) {
        saveToStore({recentMethods: [...this.state.recentMethods]})
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
        let status = this.state.status;
        if(status.currentPlace < this.state.method.method_set.stage) {
            status.currentPos =  status.currentPos + 1;
            status.userNextPlace =  status.currentPlace + 1;
            this.setState({status: status});
        }
    }

    downPlace(e) {
        let status = this.state.status;
        if(status.currentPlace > 1) {
            status.currentPos =  status.currentPos + 1;
            status.userNextPlace =  status.currentPlace - 1;
            this.setState({status: status});
        }
    }

    makePlace(e) {
        let status = this.state.status;
        status.currentPos =  status.currentPos + 1;
        status.userNextPlace =  status.currentPlace;
        this.setState({status: status})
    }

    reset(e) {
        this.setState({status: nullStatus})
    }

    newWorkingBell(e) {
        let status = this.state.status;
        status.currentBell = e.target.value;
        this.setState({status: status})
    }

    onCorrect() {
        let status = this.state.status;
        status.correct = true;
        this.setState({status: status})
    }
    onWrong() {
        let status = this.state.status;
        status.correct = true;
        status.errors += 1;
        this.setState({status: status})
    }
    setPlace(e) {
        let status = this.state.status;
        status.currentPlace = e.place;
        this.setState({status: status});
        if(e.place === status.userNextPlace || status.userNextPlace === -1) {
            this.onCorrect()
        } else {
            this.onWrong()
        }
    }
    newMethod(m) {
        let newRecentMethods = this.state.recentMethods;
        if (!newRecentMethods.has(m.id)) {
            newRecentMethods.set(m.id, m);
        }
        let status = nullStatus;
        status.currentBell = status.currentBell > m.method_set.stage ? m.method_set.stage : status.currentBell;
        this.setState({
            recentMethods: newRecentMethods,
            method: m,
            status:status
        })
    }
    removeMethod(m) {
        let recentMethods = this.state.recentMethods;
        if(recentMethods.delete(m.id)) {
            this.setState({recentMethods: recentMethods})
        }
    }
    render() {
        let method = this.state.method;
        let status = this.state.status;

        let methodRenderer = null;
        if(method !== null) {
            methodRenderer = <SVGMethod method={method} status={status} onNewPlace={this.setPlace}/>
        }

        return <div className="container">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand" href="#">
                    Method Practice Tool
                </a>
                {method && <span>Ringing the <select onChange={this.newWorkingBell} value={status.currentBell}>
                        {[... new Array(method.method_set.stage).keys()].map(r => <option key={r + 1} value={(r + 1)}>{r + 1}</option>)}
                    </select> to {method.methodName}</span>}
                <form className="form-inline ml-auto">
                    <button className="btn ml-sm-2" onClick={this.reset}>Reset</button>
                </form>

            </nav>
            <div className="row">
                <div className="col-md-4">
                    <MethodSearch onSuggestionSelected={this.newMethod}/>
                    <br />
                    <h6>Recently Rung:</h6>
                    <MethodPicker onSuggestionSelected={this.newMethod}
                                  onSuggestionDeleted={this.removeMethod}
                                  methods={Array.from(this.state.recentMethods.values())} />
                </div>
                <div className="col-md-5">
                    {methodRenderer}
                </div>
                <div className="col-md-3">
                    {status && <div>{status.errors} errors.</div>}
                </div>
            </div>
        </div>
    }
}
ReactDOM.render(<Main/>, document.getElementById('react-root-container'));
