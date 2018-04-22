import React from 'react';
import ReactDOM from 'react-dom';
import MethodSearch from './method-search.jsx'
import MethodPicker from './method-picker.jsx'
import SVGMethod from './svg-method.jsx'
import BellSelector from './bell-selector.jsx'

import './hammer.js'

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
        recentMethods: new Map(JSON.parse(localStorage.getItem("recentMethods")) || new Map())
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
        this.movePlace = this.movePlace.bind(this);
        this.backToStart = this.backToStart.bind(this);
        this.newWorkingBell = this.newWorkingBell.bind(this);
        this.onCorrect = this.onCorrect.bind(this);
        this.onWrong = this.onWrong.bind(this);
        this.setPlace = this.setPlace.bind(this);
        this.newMethod = this.newMethod.bind(this);
        this.removeMethod = this.removeMethod.bind(this);
        this.resetStatus = this.resetStatus.bind(this);
    }

    componentWillMount() {
    }

    componentWillUpdate(prevProps, prevState) {
        saveToStore({recentMethods: [...this.state.recentMethods]})
    }

    backToStart(e) {
        let status = this.state.status;
        if(status !== null) {
            this.setState({
                status: Object.assign(status, {currentPos: 1, errors : 0, userNextPlace: -1})
            })
        }
    }

    resetStatus(e) {
        this.setState({status: null, method: null})
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
        if (e.place === status.userNextPlace || status.userNextPlace === -1) {
            this.onCorrect()
        } else {
            this.onWrong()
        }
    }

    movePlace(e) {
        let status = this.state.status;
        status.currentPos = status.currentPos + 1;
        status.userNextPlace = e.nextPlace;
        this.setState({status: status});
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
            status: status
        })
    }

    removeMethod(m) {
        let recentMethods = this.state.recentMethods;
        if (recentMethods.delete(m.id)) {
            this.setState({recentMethods: recentMethods})
        }
    }

    render() {
        let method = this.state.method;
        let status = this.state.status;

        let methodRenderer = null;
        if (method !== null) {
            methodRenderer = <SVGMethod movePlace={this.movePlace} method={method} status={status} onNewPlace={this.setPlace}/>
        }

        let methodPickerView = <div className="col-sm-4 col-12 order-3 order-sm-1">
                    <MethodSearch onSuggestionSelected={this.newMethod}/>
                    <br/>
                    <h6>Recently Rung:</h6>
                    <MethodPicker onSuggestionSelected={this.newMethod}
                                  onSuggestionDeleted={this.removeMethod}
                                  methods={Array.from(this.state.recentMethods.values())}/>
                </div>;
        let methodRingingView = <div className="col-sm-5 col-12 order-1 center-content order-sm-2">
                    {methodRenderer}
                </div>;

        let currentView;

        if(this.state.method) {
            currentView = methodRingingView;
        } else {
            currentView = methodPickerView;
        }

        let statusBar;
        if(status) {
            statusBar = <span className="order-3 order-sm-2">
                <span className="d-sm-inline">Ringing the </span>
                <BellSelector stage={method.method_set.stage}
                              onChange={this.newWorkingBell}
                              currentBell={status.currentBell}
                />

                to {method.name}
                <div className="col-sm-3 col-12 order-2 order-sm-3">
                        {status && <div>{status.errors} errors.</div>}
                    </div></span>;
        }

        return <div className="container-fluid">
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                {!method && <a className="navbar-brand order-1" href="#">
                    Method Practice Tool
                </a>}
                {method && statusBar}
                <div className="form-inline ml-auto order-2 order-sm-3">
                    {method && <button className="btn ml-sm-2" onClick={this.backToStart}>Restart</button>}
                    {method && <button className="btn ml-sm-2" onClick={this.resetStatus}>New Method</button>}
                </div>

            </nav>
            <div className="row">{ currentView }</div>
        </div>
    }
}

ReactDOM.render(<Main/>, document.getElementById('react-root-container'));
