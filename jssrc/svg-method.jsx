import React from 'react'
import PropTypes from 'prop-types';
import * as Types from './types.jsx';
import * as method_utils from './method-utils.jsx';
import BellPath from './bell-path.jsx'

const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;

export default class SVGMethod extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.upPlace = this.upPlace.bind(this);
        this.downPlace = this.downPlace.bind(this);
        this.makePlace = this.makePlace.bind(this);
    }

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
        let svg_element = <svg height="400px" width={10 + 20 * (bells - 1)} className="svg-method-image" id="svg-method">
            {[... new Array(bells).keys()].map(
                (r) => <line key={r} x1={5 + 20 * r} x2={5 + 20 * r} y1="390" y2="10" stroke="lightgrey"/>)}

            <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell="1" stroke="#f00"/>
            <BellPath showRows={visibleRows} currentPos={cp} rows={rows} bell={this.props.status.currentBell}
                      stroke="#00f"
                      onNewPlace={this.props.onNewPlace}
            />
        </svg>;

        return <div style={{overflow: scroll, height: "400px"}}>{svg_element}</div>
    }

    handleKeyUp(e) {
        if (e.keyCode === KEY_LEFT) {
            this.downPlace(e);
        } else if (e.keyCode === KEY_RIGHT) {
            this.upPlace(e);
        } else if (e.keyCode === KEY_DOWN) {
            this.makePlace(e);
        }
    }

    upPlace(e) {
        let status = this.props.status;
        let method = this.props.method;
        if (status.currentPlace < method.method_set.stage) {
            this.props.movePlace({nextPlace: status.currentPlace + 1});
        }
    }

    downPlace(e) {
        let status = this.props.status;
        if (status.currentPlace > 1) {
            this.props.movePlace({nextPlace: status.currentPlace - 1});
        }
    }

    makePlace(e) {
        let status = this.props.status;
        this.props.movePlace({nextPlace: status.currentPlace});
    }

    componentDidMount() {
        let svg_element =document. getElementById('svg-method');
        let hammertime = new Hammer(svg_element, {});

        hammertime.on('tap', env => {
            let bbox = svg_element.getBoundingClientRect();
            let position = (env.center.x - bbox.left)/(bbox.width);
            if(position < 0.3) {
                this.downPlace()
            } else if (position > 0.7) {
                this.upPlace()
            } else {
                this.makePlace()
            }
        });
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
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

Row.propTypes = {
    pos: PropTypes.number.isRequired,
    currentPos: PropTypes.number.isRequired,
    line: PropTypes.array.isRequired // TODO: make this more specific
};

class Bell extends React.Component {
    render() {
        return <text x={this.props.place} y={this.props.height} fontSize={this.props.fontSize}>{this.props.bell}</text>
    }
}

Bell.propTypes = {
    place: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    fontSize: PropTypes.number.isRequired,
    bell: PropTypes.number.isRequired,
};