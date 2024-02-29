import React from 'react';
import { Container } from 'pcui';
import { Vector, Detail } from './components/index.js';
class SelectedNode extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (nextProps.sceneData.nodes !== this.props.sceneData.nodes ||
            nextProps.sceneData.selectedNode.path !== this.props.sceneData.selectedNode.path ||
            nextProps.sceneData.selectedNode.name !== this.props.sceneData.selectedNode.name ||
            nextProps.sceneData.selectedNode.position !== this.props.sceneData.selectedNode.position ||
            nextProps.sceneData.selectedNode.rotation !== this.props.sceneData.selectedNode.rotation ||
            nextProps.sceneData.selectedNode.scale !== this.props.sceneData.selectedNode.scale);
    }
    render() {
        const scene = this.props.sceneData;
        const hasHierarchy = scene.nodes !== '[]';
        const nodeSelected = scene.selectedNode.path;
        return hasHierarchy && nodeSelected ? (React.createElement("div", { className: 'selected-node-panel-parent' },
            React.createElement(Container, { class: 'selected-node-panel', flex: true },
                React.createElement(Detail, { label: 'Name', value: scene.selectedNode.name }),
                React.createElement(Vector, { label: 'Position', dimensions: 3, value: scene.selectedNode.position, enabled: false }),
                React.createElement(Vector, { label: 'Rotation', dimensions: 3, value: scene.selectedNode.rotation, enabled: false }),
                React.createElement(Vector, { label: 'Scale', dimensions: 3, value: scene.selectedNode.scale, enabled: false })))) : null;
    }
}
export default SelectedNode;
