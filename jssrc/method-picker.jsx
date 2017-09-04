import React from 'react';
import PropTypes from 'prop-types';

export default class MethodPicker extends React.Component {
    render() {
        return <div>
            <ul>
                {this.props.methods.map(m => <li key={m.id}>{m.name}</li>)}
            </ul>
        </div>
    }
}

MethodPicker.propTypes = {
    methods: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
    })).isRequired
};