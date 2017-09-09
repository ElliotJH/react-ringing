import React from 'react'
import PropTypes from 'prop-types';
import * as Types from './types.jsx';
import * as method_utils from './method-utils.jsx';
import BellPath from './bell-path.jsx'

export default class SVGMethod extends React.Component {

    render() {
        let bells = this.props.method.method_set.stage;
        let notation = method_utils.methodFromNotation(this.props.method.notation, bells);
        let rounds = [];
        for (const i of new Array(bells).keys()) {
            rounds.push(method_utils.inverse_place_map[i + 1]);
        }
        let row = rounds;
        let rows = [];
        for (const note of notation) {
            rows.push(row);
            row = method_utils.applyPlace(note, row);
        }
        rows.push(rounds);

        let visibleRows = 20;
        let cp = this.props.status.currentPos;
        {
            rows.map((r, i) => {
                return <Row currentPos={cp} line={r} pos={i + 1} key={i}/>;
            })
        }
        return <div style={{overflow: scroll, height: "500px"}}>
            <svg height="400" className="svg-method-image">
                {[... new Array(bells).keys()].map(
                    (r) => <line key={r} x1={5 + 20 * r} x2={5 + 20 * r} y1="390" y2="10" stroke="lightgrey"/>)}

                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell="1" stroke="#f00"/>
                <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell={this.props.status.currentBell}
                          stroke="#00f"
                          onNewPlace={this.props.onNewPlace}
                />
            </svg>
        </div>
    }
}
SVGMethod.propTypes = {
    method: Types.MethodType.isRequired,
    status: PropTypes.shape({
        currentPos: PropTypes.number
    }).isRequired,
    onNewPlace: PropTypes.func.isRequired
};

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