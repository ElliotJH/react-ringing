import React from "react";
import ReactDOM from 'react-dom';
import Autosuggest from 'react-autosuggest';


export default class MethodSearch extends React.Component {
    constructor(props) {
        super(props);
        this.onTextChange = this.onTextChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
        this.onSuggestionSelected = this.onSuggestionSelected.bind(this);

        this.state = {
            text: "",
            methodList: []
        }
    }
    onSuggestionSelected(e, p) {
        this.props.onSuggestionSelected(p.suggestion);
    }
    onTextChange(e, p) {
        this.setState({text: p.newValue});
    }
    onSuggestionsFetchRequested(e) {
        if(e['value'].length >= 3) {
            fetch('http://localhost:8081/method?query=' + e['value'])
                .then(response => response.json())
                .then(json => this.setState({methodList: json['methods']}))
        }
    }
    onSuggestionsClearRequested() {
        this.setState({methodList: []})
    }
    render() {
        return <div>
            <Autosuggest
                suggestions={this.state.methodList}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                onSuggestionSelected={this.onSuggestionSelected}
                renderSuggestion={s => <div className="suggestion">{s.name}</div>}
                inputProps={{value : this.state.text, onChange: this.onTextChange}}
            />
        </div>
    }
}
function getSuggestionValue(s) {
    return s.name
}