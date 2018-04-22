/// A select box for the current bell to ring

import React from 'react'
import PropTypes from 'prop-types';

export default class BellSelector extends React.Component {
    render() {
        return <select onChange={this.props.onChange} value={this.props.currentBell}>
            {[... new Array(this.props.stage).keys()].map(r => <option key={r + 1} value={(r + 1)}>{r + 1}</option>)}
        </select>
    }

}

BellSelector.propTypes = {
    stage: PropTypes.number.isRequired,
    currentBell: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
};

