import React from 'react';
import PropTypes from 'prop-types';

export default class MethodPicker extends React.Component {
    render() {
        return <div>
            <ul className="method-picker-list">
                {this.props.methods.map(m =>
                    <li
                        className="method-picker-row"
                        onClick={e => this.props.onSuggestionSelected(m)}
                        key={m.id}>{m.name}
                    </li>
                )}
            </ul>
        </div>
    }
}

MethodPicker.propTypes = {
    methods: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
    })).isRequired,
    onSuggestionSelected: PropTypes.func.isRequired
};