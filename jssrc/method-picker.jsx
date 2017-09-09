import React from 'react';
import PropTypes from 'prop-types';
import * as Types from './types.jsx';

export default class MethodPicker extends React.Component {
    render() {
        return <div>
            <ul className="method-picker-list">
                {this.props.methods.map(m =>
                    <li className="method-picker-row" key={m.id}>
                        <span
                            className="method-picker-link"
                            onClick={e => this.props.onSuggestionSelected(m)}>{m.name}</span>
                        <span
                            className="method-picker-delete"
                            onClick={e => this.props.onSuggestionDeleted(m)}
                        />
                    </li>
                )}
            </ul>
        </div>
    }
}

MethodPicker.propTypes = {
    methods: PropTypes.arrayOf(Types.MethodType).isRequired,
    onSuggestionSelected: PropTypes.func.isRequired,
    onSuggestionDeleted: PropTypes.func.isRequired
};