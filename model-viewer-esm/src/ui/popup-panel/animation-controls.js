import React from 'react';
import { Button } from 'pcui';
import { NakedSelect, NakedSlider } from '../components/index.js';
class AnimationTrackSelect extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.animationData.list !== this.props.animationData.list ||
            nextProps.animationData.playing !== this.props.animationData.playing ||
            nextProps.animationData.selectedTrack !== this.props.animationData.selectedTrack;
    }
    render() {
        const props = this.props;
        const animationsList = JSON.parse(props.animationData.list);
        const selectTrackOptions = animationsList.map((animation) => ({ v: animation, t: animation }));
        return (React.createElement(NakedSelect, { id: 'anim-track-select', width: 160, type: 'string', options: selectTrackOptions, setProperty: (value) => props.setProperty('animation.selectedTrack', value), value: props.animationData.selectedTrack }));
    }
}
class AnimationSpeedSelect extends React.Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.animationData.speed !== this.props.animationData.speed;
    }
    render() {
        const props = this.props;
        const speedOptions = [
            { v: '0.25', t: '0.25x' },
            { v: '0.5', t: '0.5x' },
            { v: '1', t: '1x' },
            { v: '1.5', t: '1.5x' },
            { v: '2', t: '2x' }
        ];
        return (React.createElement(NakedSelect, { id: 'anim-speed-select', width: 60, type: 'string', setProperty: (value) => props.setProperty('animation.speed', value), value: props.animationData.speed, options: speedOptions }));
    }
}
class AnimationControls extends React.Component {
    animationState;
    shouldComponentUpdate(nextProps) {
        return JSON.stringify(nextProps.animationData) !== JSON.stringify(this.props.animationData);
    }
    componentDidUpdate() {
        this.animationState = this.props.animationData;
    }
    render() {
        const props = this.props;
        const animationsList = JSON.parse(props.animationData.list);
        const enabled = animationsList.length > 0;
        return enabled ? (React.createElement("div", { className: 'animation-controls-panel-parent' },
            React.createElement(Button, { class: 'anim-control-button', width: 30, height: 30, icon: props.animationData.playing ? 'E376' : 'E286', text: '', onClick: () => {
                    props.setProperty('animation.playing', !this.animationState.playing);
                } }),
            React.createElement(AnimationTrackSelect, { animationData: this.props.animationData, setProperty: this.props.setProperty }),
            React.createElement(NakedSlider, { id: 'anim-scrub-slider', width: 240, precision: 2, min: 0, max: 1, setProperty: (value) => {
                    const animationState = this.animationState;
                    animationState.playing = false;
                    animationState.progress = value;
                    props.setProperty('animation', animationState);
                }, value: props.animationData.progress }),
            React.createElement(AnimationSpeedSelect, { animationData: this.props.animationData, setProperty: this.props.setProperty }))) : React.createElement("div", null);
    }
}
export default AnimationControls;
