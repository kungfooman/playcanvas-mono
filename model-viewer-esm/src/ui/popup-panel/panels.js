import React from 'react';
import { Container, Button, Label, TextInput } from 'pcui';
import { extract } from '../../helpers.js';
// @ts-ignore no type defs included
import QRious from 'qrious';
import { Slider, Toggle, Select, ColorPickerControl, ToggleColor, Numeric } from '../components/index.js';
const rgbToArr = (rgb) => [rgb.r, rgb.g, rgb.b, 1];
const arrToRgb = (arr) => { return { r: arr[0], g: arr[1], b: arr[2] }; };
class CameraPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        const keys = ['ui', 'debug', 'animation.playing'];
        const a = extract(nextProps.observerData, keys);
        const b = extract(this.props.observerData, keys);
        return JSON.stringify(a) !== JSON.stringify(b);
    }
    render() {
        const props = this.props;
        return (React.createElement("div", { className: 'popup-panel-parent' },
            React.createElement(Container, { class: 'popup-panel', flex: true, hidden: props.observerData.ui.active !== 'camera' },
                React.createElement(Label, { text: 'Camera', class: 'popup-panel-heading' }),
                React.createElement(Slider, { label: 'Fov', precision: 0, min: 35, max: 150, value: props.observerData.camera.fov, setProperty: (value) => props.setProperty('camera.fov', value) }),
                React.createElement(Select, { label: 'Tonemap', type: 'string', options: ['Linear', 'Filmic', 'Hejl', 'ACES', 'ACES2'].map(v => ({ v, t: v })), value: props.observerData.camera.tonemapping, setProperty: (value) => props.setProperty('camera.tonemapping', value) }),
                React.createElement(Select, { label: 'Pixel Scale', value: props.observerData.camera.pixelScale, type: 'number', options: [1, 2, 4, 8, 16].map(v => ({ v: v, t: Number(v).toString() })), setProperty: (value) => props.setProperty('camera.pixelScale', value) }),
                React.createElement(Toggle, { label: 'Multisample', value: props.observerData.camera.multisample, enabled: props.observerData.camera.multisampleSupported, setProperty: (value) => props.setProperty('camera.multisample', value) }),
                React.createElement(Toggle, { label: 'High Quality', value: props.observerData.camera.hq, enabled: !props.observerData.animation.playing && !props.observerData.debug.stats && props.observerData.runtime.activeDeviceType !== 'webgpu', setProperty: (value) => props.setProperty('camera.hq', value) }))));
    }
}
class SkyboxPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.skyboxData) !== JSON.stringify(this.props.skyboxData) ||
            JSON.stringify(nextProps.uiData) !== JSON.stringify(this.props.uiData);
    }
    render() {
        const props = this.props;
        return (React.createElement("div", { className: 'popup-panel-parent' },
            React.createElement(Container, { class: 'popup-panel', flex: true, hidden: props.uiData.active !== 'skybox' },
                React.createElement(Label, { text: 'Sky', class: 'popup-panel-heading' }),
                React.createElement(Select, { label: 'Environment', type: 'string', options: JSON.parse(props.skyboxData.options), value: props.skyboxData.value, setProperty: (value) => props.setProperty('skybox.value', value) }),
                React.createElement(Slider, { label: 'Exposure', value: props.skyboxData.exposure, setProperty: (value) => props.setProperty('skybox.exposure', value), precision: 2, min: -6, max: 6, enabled: props.skyboxData.value !== 'None' }),
                React.createElement(Slider, { label: 'Rotation', precision: 0, min: -180, max: 180, value: props.skyboxData.rotation, setProperty: (value) => props.setProperty('skybox.rotation', value), enabled: props.skyboxData.value !== 'None' }),
                React.createElement(Select, { label: 'Background', type: 'string', options: ['Solid Color', 'Infinite Sphere', 'Projective Dome'].map(v => ({ v, t: v })), value: props.skyboxData.background, setProperty: (value) => props.setProperty('skybox.background', value), enabled: props.skyboxData.value !== 'None' }),
                React.createElement(ColorPickerControl, { label: 'Background Color', value: rgbToArr(props.skyboxData.backgroundColor), setProperty: (value) => props.setProperty('skybox.backgroundColor', arrToRgb(value)), enabled: props.skyboxData.value === 'None' || props.skyboxData.background === 'Solid Color' }),
                React.createElement(Slider, { label: 'Blur', 
                    // type='number'
                    // options={[0, 1, 2, 3, 4, 5].map(v => ({ v: v, t: v === 0 ? 'Disabled' : `Mip ${v}` }))}
                    value: props.skyboxData.blur, setProperty: (value) => props.setProperty('skybox.blur', value), enabled: props.skyboxData.value !== 'None' && props.skyboxData.background === 'Infinite Sphere', min: 0, max: 5, precision: 0, step: 1 }),
                React.createElement(Numeric, { label: 'Dome Radius', value: props.skyboxData.domeProjection.domeRadius, setProperty: (value) => props.setProperty('skybox.domeProjection.domeRadius', value), min: 0, max: 1000, enabled: props.skyboxData.value !== 'None' && props.skyboxData.background === 'Projective Dome' }),
                React.createElement(Slider, { label: 'Dome Offset', value: props.skyboxData.domeProjection.domeOffset, setProperty: (value) => props.setProperty('skybox.domeProjection.domeOffset', value), min: -1, max: 1, precision: 2, enabled: props.skyboxData.value !== 'None' && props.skyboxData.background === 'Projective Dome' }),
                React.createElement(Slider, { label: 'Tripod Offset', value: props.skyboxData.domeProjection.tripodOffset, setProperty: (value) => props.setProperty('skybox.domeProjection.tripodOffset', value), min: 0, max: 1, precision: 2, enabled: props.skyboxData.value !== 'None' && props.skyboxData.background === 'Projective Dome' }))));
    }
}
class LightPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.lightData) !== JSON.stringify(this.props.lightData) ||
            JSON.stringify(nextProps.uiData) !== JSON.stringify(this.props.uiData);
    }
    render() {
        const props = this.props;
        return (React.createElement("div", { className: 'popup-panel-parent' },
            React.createElement(Container, { class: 'popup-panel', flex: true, hidden: props.uiData.active !== 'light' },
                React.createElement(Label, { text: 'Light', class: 'popup-panel-heading' }),
                React.createElement(Toggle, { label: 'Enabled', value: props.lightData.enabled, setProperty: (value) => props.setProperty('light.enabled', value) }),
                React.createElement(Toggle, { label: 'Follow Camera', value: props.lightData.follow, setProperty: (value) => props.setProperty('light.follow', value) }),
                React.createElement(ColorPickerControl, { label: 'Color', value: rgbToArr(props.lightData.color), setProperty: (value) => props.setProperty('light.color', arrToRgb(value)) }),
                React.createElement(Slider, { label: 'Intensity', precision: 2, min: 0, max: 6, value: props.lightData.intensity, setProperty: (value) => props.setProperty('light.intensity', value) }),
                React.createElement(Toggle, { label: 'Cast Shadow', value: props.lightData.shadow, setProperty: (value) => props.setProperty('light.shadow', value) }),
                React.createElement(Toggle, { label: 'Shadow Catcher', value: props.shadowCatcherData.enabled, setProperty: (value) => props.setProperty('shadowCatcher.enabled', value) }),
                React.createElement(Slider, { label: 'Catcher Intensity', precision: 2, min: 0, max: 1, value: props.shadowCatcherData.intensity, setProperty: (value) => props.setProperty('shadowCatcher.intensity', value) }))));
    }
}
class DebugPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.debugData) !== JSON.stringify(this.props.debugData) ||
            JSON.stringify(nextProps.uiData) !== JSON.stringify(this.props.uiData);
    }
    render() {
        const renderModeOptions = [
            { t: 'Default', v: 'default' },
            { t: 'Lighting', v: 'lighting' },
            { t: 'Albedo', v: 'albedo' },
            { t: 'Emissive', v: 'emission' },
            { t: 'WorldNormal', v: 'world_normal' },
            { t: 'Metalness', v: 'metalness' },
            { t: 'Gloss', v: 'gloss' },
            { t: 'Ao', v: 'ao' },
            { t: 'Specularity', v: 'specularity' },
            { t: 'Opacity', v: 'opacity' },
            { t: 'Uv0', v: 'uv0' }
        ];
        const props = this.props;
        return (React.createElement("div", { className: 'popup-panel-parent' },
            React.createElement(Container, { class: 'popup-panel', flex: true, hidden: props.uiData.active !== 'debug' },
                React.createElement(Label, { text: 'Debug', class: 'popup-panel-heading' }),
                React.createElement(Select, { label: 'Render Mode', type: 'string', options: renderModeOptions, value: props.debugData.renderMode, setProperty: (value) => props.setProperty('debug.renderMode', value) }),
                React.createElement(ToggleColor, { label: 'Wireframe', booleanValue: props.debugData.wireframe, setBooleanProperty: (value) => props.setProperty('debug.wireframe', value), colorValue: rgbToArr(props.debugData.wireframeColor), setColorProperty: (value) => props.setProperty('debug.wireframeColor', arrToRgb(value)) }),
                React.createElement(Toggle, { label: 'Grid', value: props.debugData.grid, setProperty: (value) => props.setProperty('debug.grid', value) }),
                React.createElement(Toggle, { label: 'Axes', value: props.debugData.axes, setProperty: (value) => props.setProperty('debug.axes', value) }),
                React.createElement(Toggle, { label: 'Skeleton', value: props.debugData.skeleton, setProperty: (value) => props.setProperty('debug.skeleton', value) }),
                React.createElement(Toggle, { label: 'Bounds', value: props.debugData.bounds, setProperty: (value) => props.setProperty('debug.bounds', value) }),
                React.createElement(Slider, { label: 'Normals', precision: 2, min: 0, max: 1, setProperty: (value) => props.setProperty('debug.normals', value), value: props.debugData.normals }),
                React.createElement(Toggle, { label: 'Stats', value: props.debugData.stats, setProperty: (value) => props.setProperty('debug.stats', value) }))));
    }
}
class ViewPanel extends React.Component {
    isMobile;
    get shareUrl() {
        return `${location.origin}${location.pathname}?${this.props.sceneData.urls.map((url) => `load=${url}`).join('&')}`;
    }
    constructor(props) {
        super(props);
        this.isMobile = (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.sceneData) !== JSON.stringify(this.props.sceneData) ||
            JSON.stringify(nextProps.uiData) !== JSON.stringify(this.props.uiData);
    }
    get hasQRCode() {
        return this.props.sceneData.urls.length > 0 && !this.isMobile;
    }
    updateQRCode() {
        const canvas = document.getElementById('share-qr');
        const qr = new QRious({
            element: canvas,
            value: this.shareUrl,
            size: canvas.getBoundingClientRect().width * window.devicePixelRatio
        });
    }
    componentDidMount() {
        if (this.hasQRCode) {
            this.updateQRCode();
        }
    }
    componentDidUpdate() {
        if (this.hasQRCode) {
            this.updateQRCode();
        }
    }
    render() {
        const props = this.props;
        return (React.createElement("div", { className: 'popup-panel-parent' },
            React.createElement(Container, { id: 'view-panel', class: 'popup-panel', flex: true, hidden: props.uiData.active !== 'view' },
                this.hasQRCode ?
                    React.createElement(React.Fragment, null,
                        React.createElement(Label, { text: 'View and share on mobile with QR code' }),
                        React.createElement("div", { id: 'qr-wrapper' },
                            React.createElement("canvas", { id: 'share-qr' })),
                        React.createElement(Label, { text: 'View and share on mobile with URL' }),
                        React.createElement("div", { id: 'share-url-wrapper' },
                            React.createElement(TextInput, { class: 'secondary', value: this.shareUrl, enabled: false }),
                            React.createElement(Button, { id: 'copy-button', icon: 'E126', onClick: () => {
                                    if (navigator.clipboard && window.isSecureContext) {
                                        navigator.clipboard.writeText(this.shareUrl);
                                    }
                                } }))) : null,
                React.createElement(Button, { class: 'secondary', text: 'TAKE A SNAPSHOT AS PNG', enabled: props.runtimeData.activeDeviceType !== 'webgpu', onClick: () => {
                        if (window.viewer)
                            window.viewer.downloadPngScreenshot();
                    } }))));
    }
}
export { CameraPanel, SkyboxPanel, LightPanel, DebugPanel, ViewPanel };
