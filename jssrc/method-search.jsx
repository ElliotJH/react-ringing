import React from "react";
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
        if (e['value'].length >= 3) {
            fetch('https://ringing-method-server.resborand.co.uk/method?query=' + e['value'])
                .then(response => response.json())
                .then(json => this.setState({methodList: json['methods']}))
        }
    }

    onSuggestionsClearRequested() {
        this.setState({methodList: []})
    }

    render() {
        return <div>
            <h6>Method Search:</h6>
            <Autosuggest
                suggestions={this.state.methodList}
                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                getSuggestionValue={getSuggestionValue}
                onSuggestionSelected={this.onSuggestionSelected}
                renderSuggestion={s => <div className="suggestion">{s.name}</div>}
                inputProps={{
                    type: "text",
                    className: "form-control",
                    value: this.state.text,
                    onChange: this.onTextChange,
                    placeholder: "Enter method name..."
                }}
            />
        </div>
    }
}

function getSuggestionValue(s) {
    return s.name
}