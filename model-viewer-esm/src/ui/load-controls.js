import React, { useRef, useState } from 'react';
import { Container, Label, Button, TextInput } from 'pcui';
import { getLogo } from '../helpers.js';
const validUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
const LoadControls = (props) => {
    const [urlInputValid, setUrlInputValid] = useState(false);
    const inputFile = useRef(null);
    const onLoadButtonClick = () => {
        // `current` points to the mounted file input element
        inputFile.current.click();
    };
    const onFileSelected = (event) => {
        // `event` points to the selected file
        const viewer = window.viewer;
        const files = event.target.files;
        if (viewer && files.length) {
            const loadList = [];
            for (let i = 0; i < files.length; ++i) {
                const file = files[i];
                loadList.push({
                    url: URL.createObjectURL(file),
                    filename: file.name
                });
            }
            viewer.loadFiles(loadList);
        }
    };
    const onUrlSelected = () => {
        const viewer = window.viewer;
        // @ts-ignore
        const value = document.getElementById('glb-url-input').ui.value;
        const url = new URL(value);
        const filename = url.pathname.split('/').pop();
        const hasExtension = !!filename.split('.').splice(1).pop();
        viewer.loadFiles([{
                url: value,
                filename: filename + (hasExtension ? '' : '.glb')
            }]);
    };
    return (React.createElement("div", { id: 'load-controls' },
        React.createElement(Container, { class: "load-button-panel", enabled: true, flex: true },
            React.createElement("div", { className: 'header' },
                React.createElement("img", { src: getLogo() }),
                React.createElement("div", null,
                    React.createElement(Label, { text: 'PLAYCANVAS MODEL VIEWER' })),
                React.createElement(Button, { onClick: () => {
                        window.open('https://github.com/playcanvas/model-viewer', '_blank').focus();
                    }, icon: 'E259' })),
            React.createElement("input", { type: 'file', id: 'file', multiple: true, onChange: onFileSelected, ref: inputFile, style: { display: 'none' } }),
            React.createElement("div", { id: "drag-drop", onClick: onLoadButtonClick },
                React.createElement(Button, { id: "drag-drop-search-icon", icon: 'E129' }),
                React.createElement(Label, { class: 'desktop', text: "Drag & drop your files or click to open files" }),
                React.createElement(Label, { class: 'mobile', text: "Click to open files" })),
            React.createElement(Label, { id: 'or-text', text: "OR", class: "centered-label" }),
            React.createElement(TextInput, { class: 'secondary', id: 'glb-url-input', placeholder: 'enter url', keyChange: true, onValidate: (value) => {
                    const isValid = validUrl(value);
                    setUrlInputValid(isValid);
                    return isValid;
                } }),
            React.createElement(Button, { class: 'secondary', id: 'glb-url-button', text: 'LOAD MODEL FROM URL', onClick: onUrlSelected, enabled: urlInputValid }))));
};
export default LoadControls;
