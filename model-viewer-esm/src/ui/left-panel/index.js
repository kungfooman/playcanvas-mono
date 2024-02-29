import React from 'react';
import { Panel, Container, TreeViewItem, TreeView } from 'pcui';
import { Detail, Select, Toggle, Vector } from '../components/index.js';
import { addEventListenerOnClickOnly } from '../../helpers.js';
import MorphTargetPanel from './morph-target-panel.js';
const toggleCollapsed = () => {
    const leftPanel = document.getElementById('panel-left');
    if (leftPanel) {
        leftPanel.classList.toggle('collapsed');
    }
};
let leftPanel;
const openPanel = () => {
    if (!leftPanel) {
        leftPanel = document.getElementById('panel-left');
    }
    if (leftPanel && leftPanel.classList.contains('collapsed')) {
        leftPanel.classList.remove('collapsed');
    }
};
const bytesToSizeString = (bytes) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return 'n/a';
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
    return (i === 0) ? `${bytes} ${sizes[i]}` : `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
};
class ScenePanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (JSON.stringify(nextProps.sceneData.filenames) !== JSON.stringify(this.props.sceneData.filenames) ||
            nextProps.sceneData.loadTime !== this.props.sceneData.loadTime ||
            nextProps.sceneData.meshCount !== this.props.sceneData.meshCount ||
            nextProps.sceneData.vertexCount !== this.props.sceneData.vertexCount ||
            nextProps.sceneData.primitiveCount !== this.props.sceneData.primitiveCount ||
            nextProps.sceneData.materialCount !== this.props.sceneData.materialCount ||
            nextProps.sceneData.textureVRAM !== this.props.sceneData.textureVRAM ||
            nextProps.sceneData.meshVRAM !== this.props.sceneData.meshVRAM ||
            nextProps.sceneData.bounds !== this.props.sceneData.bounds ||
            nextProps.sceneData.variant.selected !== this.props.sceneData.variant.selected ||
            nextProps.sceneData.variants.list !== this.props.sceneData.variants.list);
    }
    render() {
        const scene = this.props.sceneData;
        const variantListOptions = JSON.parse(scene.variants.list).map((variant) => ({ v: variant, t: variant }));
        return (React.createElement(Panel, { headerText: 'SCENE', id: 'scene-panel', flexShrink: '0', flexGrow: '0', collapsible: false },
            React.createElement(Detail, { label: 'Filename', value: scene.filenames.join(', ') }),
            React.createElement(Detail, { label: 'Meshes', value: scene.meshCount }),
            React.createElement(Detail, { label: 'Materials', value: scene.materialCount }),
            React.createElement(Detail, { label: 'Textures', value: scene.textureCount }),
            React.createElement(Detail, { label: 'Primitives', value: scene.primitiveCount }),
            React.createElement(Detail, { label: 'Verts', value: scene.vertexCount }),
            React.createElement(Detail, { label: 'Mesh VRAM', value: bytesToSizeString(scene.meshVRAM) }),
            React.createElement(Detail, { label: 'Texture VRAM', value: bytesToSizeString(scene.textureVRAM) }),
            React.createElement(Detail, { label: 'Load time', value: scene.loadTime }),
            React.createElement(Vector, { label: 'Bounds', dimensions: 3, value: scene.bounds, enabled: false }),
            React.createElement(Select, { label: 'Variant', type: 'string', options: variantListOptions, value: scene.variant.selected, setProperty: (value) => {
                    this.props.setProperty('scene.variant.selected', value);
                }, enabled: variantListOptions.length > 0 })));
    }
}
class HierarchyPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (nextProps.sceneData.nodes !== this.props.sceneData.nodes);
    }
    render() {
        const scene = this.props.sceneData;
        const modelHierarchy = JSON.parse(scene.nodes);
        const mapNodes = (nodes) => {
            return nodes.map((node) => React.createElement(TreeViewItem, { text: `${node.name}`, key: node.path, onSelect: (TreeViewItem) => {
                    this.props.setProperty('scene.selectedNode.path', node.path);
                    const removeEventListener = addEventListenerOnClickOnly(document.body, () => {
                        TreeViewItem.selected = false;
                        removeEventListener();
                    }, 4);
                }, onDeselect: () => this.props.setProperty('scene.selectedNode.path', '') }, mapNodes(node.children)));
        };
        return (React.createElement(Panel, { headerText: 'HIERARCHY', class: 'scene-hierarchy-panel', enabled: modelHierarchy.length > 0, collapsible: false }, modelHierarchy.length > 0 &&
            React.createElement(TreeView, { allowReordering: false, allowDrag: false }, mapNodes(modelHierarchy))));
    }
}
class DevicePanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.observerData.runtime) !== JSON.stringify(this.props.observerData.runtime) ||
            nextProps.observerData.enableWebGPU !== this.props.observerData.enableWebGPU;
    }
    render() {
        const runtime = this.props.observerData.runtime;
        return (React.createElement(Panel, { headerText: 'DEVICE', id: 'device-panel', collapsible: false },
            React.createElement(Toggle, { label: "Use WebGPU", value: this.props.observerData.enableWebGPU, enabled: navigator.gpu !== undefined, setProperty: (value) => this.props.setProperty('enableWebGPU', value) }),
            React.createElement(Detail, { label: 'Active Device', value: runtime.activeDeviceType === 'webgpu' ? 'webgpu (beta)' : runtime.activeDeviceType }),
            React.createElement(Detail, { label: 'Viewport', value: `${runtime.viewportWidth} x ${runtime.viewportHeight}` })));
    }
}
class LeftPanel extends React.Component {
    isMobile;
    constructor(props) {
        super(props);
        this.isMobile = (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.observerData.scene) !== JSON.stringify(this.props.observerData.scene) ||
            JSON.stringify(nextProps.observerData.runtime) !== JSON.stringify(this.props.observerData.runtime);
    }
    componentDidMount() {
        // set up the control panel toggle button
        document.getElementById('panel-toggle').addEventListener('click', function () {
            toggleCollapsed();
        });
        document.getElementById('title').addEventListener('click', function () {
            toggleCollapsed();
        });
        // we require this setTimeout because panel isn't yet created and so fails
        // otherwise.
        setTimeout(() => toggleCollapsed());
    }
    componentDidUpdate(prevProps) {
        if (!this.isMobile && prevProps.observerData.scene.nodes === '[]' && this.props.observerData.scene.nodes !== '[]') {
            openPanel();
        }
    }
    render() {
        const scene = this.props.observerData.scene;
        const morphs = this.props.observerData.morphs;
        return (React.createElement(Container, { id: 'scene-container', flex: true },
            React.createElement(ScenePanel, { sceneData: scene, setProperty: this.props.setProperty }),
            React.createElement("div", { id: 'scene-scrolly-bits' },
                React.createElement(HierarchyPanel, { sceneData: scene, setProperty: this.props.setProperty }),
                React.createElement(MorphTargetPanel, { progress: this.props.observerData.animation.progress, morphs: morphs, setProperty: this.props.setProperty })),
            React.createElement(DevicePanel, { observerData: this.props.observerData, setProperty: this.props.setProperty })));
    }
}
export default LeftPanel;
