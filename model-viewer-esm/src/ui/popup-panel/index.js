import React from 'react';
import { Button } from 'pcui';
import AnimationControls from './animation-controls.js';
import { CameraPanel, SkyboxPanel, LightPanel, DebugPanel, ViewPanel } from './panels.js';
// @ts-ignore no type defs included
import { UsdzExporter } from 'playcanvas-extras';
import { addEventListenerOnClickOnly } from '../../helpers.js';
const PopupPanelControls = (props) => {
    return (React.createElement(React.Fragment, null,
        React.createElement(CameraPanel, { setProperty: props.setProperty, observerData: props.observerData }),
        React.createElement(SkyboxPanel, { setProperty: props.setProperty, skyboxData: props.observerData.skybox, uiData: props.observerData.ui }),
        React.createElement(LightPanel, { setProperty: props.setProperty, lightData: props.observerData.light, uiData: props.observerData.ui, shadowCatcherData: props.observerData.shadowCatcher }),
        React.createElement(DebugPanel, { setProperty: props.setProperty, debugData: props.observerData.debug, uiData: props.observerData.ui }),
        React.createElement(ViewPanel, { setProperty: props.setProperty, sceneData: props.observerData.scene, uiData: props.observerData.ui, runtimeData: props.observerData.runtime })));
};
class PopupButtonControls extends React.Component {
    popupPanelElement;
    render() {
        let removeDeselectEvents;
        const handleClick = (value) => {
            this.props.setProperty('ui.active', this.props.observerData.ui.active === value ? null : value);
            // after a popup button is set active, listen for another click outside the panel to deactivate it
            if (!this.popupPanelElement)
                this.popupPanelElement = document.getElementById('popup');
            // add the event listener after the current click is complete
            setTimeout(() => {
                if (removeDeselectEvents)
                    removeDeselectEvents();
                const deactivateUi = (e) => {
                    if (this.popupPanelElement.contains(e.target)) {
                        return;
                    }
                    this.props.setProperty('ui.active', null);
                    removeDeselectEvents();
                    removeDeselectEvents = null;
                };
                removeDeselectEvents = addEventListenerOnClickOnly(document.body, deactivateUi, 4);
            });
        };
        const buildClass = (value) => {
            return (this.props.observerData.ui.active === value) ? ['popup-button', 'selected'] : ['popup-button'];
        };
        return (React.createElement("div", { id: 'popup-buttons-parent' },
            React.createElement(AnimationControls, { animationData: this.props.observerData.animation, setProperty: this.props.setProperty }),
            React.createElement(Button, { class: buildClass('camera'), icon: 'E212', width: 40, height: 40, onClick: () => handleClick('camera') }),
            React.createElement(Button, { class: buildClass('skybox'), icon: 'E200', width: 40, height: 40, onClick: () => handleClick('skybox') }),
            React.createElement(Button, { class: buildClass('light'), icon: 'E194', width: 40, height: 40, onClick: () => handleClick('light') }),
            React.createElement(Button, { class: buildClass('debug'), icon: 'E134', width: 40, height: 40, onClick: () => handleClick('debug') }),
            React.createElement(Button, { class: buildClass('view'), icon: 'E301', width: 40, height: 40, onClick: () => handleClick('view') })));
    }
}
const toggleCollapsed = () => {
    document.getElementById('panel-left').classList.toggle('collapsed');
};
class PopupPanel extends React.Component {
    link;
    usdzExporter;
    get hasArSupport() {
        return this.props.observerData.runtime.xrSupported || this.usdzExporter;
    }
    constructor(props) {
        super(props);
        this.link = document.getElementById('ar-link');
        if (this.link.relList.supports("ar") || (Boolean(window.webkit?.messageHandlers) && Boolean(/CriOS\/|EdgiOS\/|FxiOS\/|GSA\/|DuckDuckGo\//.test(navigator.userAgent)))) {
            // @ts-ignore
            this.usdzExporter = new UsdzExporter();
        }
    }
    render() {
        return (React.createElement("div", { id: 'popup', className: this.props.observerData.scene.nodes === '[]' ? 'empty' : null },
            React.createElement(PopupPanelControls, { observerData: this.props.observerData, setProperty: this.props.setProperty }),
            React.createElement(PopupButtonControls, { observerData: this.props.observerData, setProperty: this.props.setProperty }),
            React.createElement(Button, { class: 'popup-button', id: 'launch-ar-button', icon: 'E189', hidden: !this.hasArSupport || this.props.observerData.scene.nodes === '[]', width: 40, height: 40, onClick: () => {
                    if (this.usdzExporter) {
                        const sceneRoot = window.viewer.app.root.findByName('sceneRoot');
                        // convert the loaded entity into asdz file
                        this.usdzExporter.build(sceneRoot).then((arrayBuffer) => {
                            const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
                            this.link.href = URL.createObjectURL(blob);
                            this.link.click();
                        }).catch(console.error);
                    }
                    else {
                        if (window.viewer)
                            window.viewer.xrMode.start();
                    }
                } }),
            React.createElement("div", { id: 'floating-buttons-parent' },
                React.createElement(Button, { class: 'popup-button', id: 'fullscreen-button', icon: 'E127', width: 40, height: 40, onClick: () => {
                        toggleCollapsed();
                    } }))));
    }
}
export default PopupPanel;
