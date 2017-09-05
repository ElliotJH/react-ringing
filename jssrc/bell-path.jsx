import React from 'react';
import * as method_utils from './method-utils.jsx';

export default class BellPath extends React.Component {
    currentBell() {
        return method_utils.inverse_place_map[this.props.bell]
    }
    placeAtRow(p) {
        return this.props.rows[p - 1].indexOf(this.currentBell())
    }
    currentPlace() {
        return this.placeAtRow(this.props.currentPos)
    }
    nextPlace() {
        return this.placeAtRow(this.props.currentPos + 1)
    }
    nextAction() {
        return this.nextPlace() - this.currentPlace()
    }
    // currentPos, showRows, bell, stroke
    componentWillReceiveProps(nextProps) {
        if (this.props.onNewPlace !== undefined) {
            if (nextProps.currentPos > 0) { // Think this should be nextprops
                if (nextProps.currentPos < nextProps.rows.length) {
                    if (nextProps.currentPos !== this.props.currentPos || nextProps.bell !== this.props.bell) {
                        nextProps.onNewPlace({
                            place: nextProps.rows[nextProps.currentPos - 1].indexOf(method_utils.inverse_place_map[nextProps.bell]) + 1
                        })
                    }
                }
            }
        }
    }
    /* BellPath draws an SVG Path tracing the path of a single bell */
    render() {
        const columnWidth = 20, columnPadding = 20;
        /*
            Find the subset of rows we will actually draw (this allows us to work down through the page)

            TODO proper scrolling implemented in SVG.

            firstRowToShow = the smallest numbered row we will draw, non-negative.
            currentPos - showRows = the smallest numbered row we will draw (but might be negative).
            currentPos = how many lines we are through the method
            showRows = number of rows to draw
         */
        let currentPos = this.props.currentPos;
        if(currentPos >= this.props.rows.length) {
            currentPos = this.props.rows.length;
        }

        let firstRowToShow = Math.max(0, currentPos - this.props.showRows);
        let rows = this.props.rows.slice(firstRowToShow, currentPos);

        let path = diff(rows.map(r => r.indexOf(this.currentBell())), 0)
            .map(relIndex => [relIndex * columnWidth + "," + columnPadding]);

        if (path.length > 0) {
            return <path d={"M 5,-10 m " + path.join(" l ")} fill="none" stroke={this.props.stroke}
                         strokeWidth="1.5px"/>
        } else {
            return <path/>
        }
    }
}

function diff(l, initial) {
    /* Convert a list of numbers to a list of differences */
    let outArray = l.slice();
    let last = initial;
    for(let i = 0; i < outArray.length; i++) {
        outArray[i] = l[i] - last;
        last = l[i];
    }
    return outArray;
}
