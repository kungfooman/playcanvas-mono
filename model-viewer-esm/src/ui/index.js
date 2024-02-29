import React from 'react';
import ReactDOM from 'react-dom';
import { Container, Spinner } from 'pcui';
import { getAssetPath } from '../helpers.js';
import LeftPanel from './left-panel/index.js';
import SelectedNode from './selected-node.js';
import PopupPanel from './popup-panel/index.js';
import LoadControls from './load-controls.js';
import ErrorBox from './errors.js';
class App extends React.Component {
    state;
    canvasRef;
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
        this.state = this._retrieveState();
        props.observer.on('*:set', () => {
            // update the state
            this.setState(this._retrieveState());
        });
    }
    _retrieveState = () => {
        const state = {};
        this.props.observer._keys.forEach((key) => {
            state[key] = this.props.observer.get(key);
        });
        return state;
    };
    _setStateProperty = (path, value) => {
        this.props.observer.set(path, value);
    };
    render() {
        return React.createElement("div", { id: "application-container" },
            React.createElement(Container, { id: "panel-left", flex: true, resizable: 'right', resizeMin: 220, resizeMax: 800 },
                React.createElement("div", { className: "header", style: { display: 'none' } },
                    React.createElement("div", { id: "title" },
                        React.createElement("img", { src: getAssetPath('playcanvas-logo.png') }),
                        React.createElement("div", null, "PLAYCANVAS MODEL VIEWER"))),
                React.createElement("div", { id: "panel-toggle" },
                    React.createElement("img", { src: getAssetPath('playcanvas-logo.png') })),
                React.createElement(LeftPanel, { observerData: this.state, setProperty: this._setStateProperty })),
            React.createElement("div", { id: 'canvas-wrapper' },
                React.createElement("canvas", { id: "application-canvas", ref: this.canvasRef }),
                React.createElement(LoadControls, { setProperty: this._setStateProperty }),
                React.createElement(SelectedNode, { sceneData: this.state.scene }),
                React.createElement(PopupPanel, { observerData: this.state, setProperty: this._setStateProperty }),
                React.createElement(ErrorBox, { observerData: this.state }),
                React.createElement(Spinner, { id: "spinner", size: 30, hidden: true })));
    }
}
export default (observer) => {
    // render out the app
    const element = React.createElement(App, { observer });
    const container = document.getElementById('app');
    ReactDOM.render(element, container);
};
