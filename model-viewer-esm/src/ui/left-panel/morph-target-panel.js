import React from 'react';
import VisibilitySensor from 'react-visibility-sensor';
import { Panel } from 'pcui';
import { MorphSlider } from '../components/index.js';
class MorphTargetPanel extends React.Component {
    shouldComponentUpdate(nextProps) {
        return (JSON.stringify(nextProps.morphs) !== JSON.stringify(this.props.morphs));
    }
    render() {
        const morphs = this.props.morphs;
        return morphs ? (React.createElement(Panel, { headerText: 'MORPH TARGETS', class: 'scene-morph-panel', collapsible: false }, Object.keys(morphs).map((morphIndex) => {
            const morph = morphs[morphIndex];
            return (React.createElement("div", { key: `${morphIndex}.${morph.name}` },
                React.createElement(Panel, { headerText: morph.name, collapsible: true, class: 'morph-target-panel' }, Object.keys(morph.targets).map((targetIndex) => {
                    const morphTarget = morph.targets[targetIndex];
                    return React.createElement("div", { key: targetIndex },
                        React.createElement(VisibilitySensor, { offset: { top: -750, bottom: -750 } }, ({ isVisible }) => {
                            return React.createElement("div", null, isVisible ?
                                React.createElement(MorphSlider, { name: `${morphTarget.name}`, precision: 2, min: 0, max: 1, value: morphTarget.weight, setProperty: (value) => this.props.setProperty(`morphs.${morphIndex}.targets.${targetIndex}.weight`, value) }) :
                                React.createElement("div", { style: { width: 30, height: 30 } }));
                        }));
                }))));
        }))) : null;
    }
}
export default MorphTargetPanel;
