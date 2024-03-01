import React from 'react';
import { BooleanInput, ColorPicker, Container, Label, SelectInput, SliderInput, VectorInput, NumericInput } from 'pcui';
export const Detail = (props) => {
    return React.createElement(Container, { class: 'panel-option' },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(Label, { class: 'panel-value', text: String(props.value) }));
};
export const Vector = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(VectorInput, { class: 'panel-value', dimensions: props.dimensions, value: props.value, precision: 7 }));
};
export const Toggle = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(BooleanInput, { class: 'panel-value-boolean', type: 'toggle', value: props.value, onChange: (value) => props.setProperty(value) }));
};
export const ToggleColor = (props) => {
    return React.createElement(Container, { class: 'panel-option' },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(Container, { class: 'panel-value' },
            React.createElement(BooleanInput, { type: 'toggle', value: props.booleanValue, onChange: (value) => props.setBooleanProperty(value) }),
            React.createElement(ColorPicker, { class: 'panel-value-toggle-color', value: props.colorValue, onChange: (value) => props.setColorProperty(value) })));
};
export const SelectColor = (props) => {
    return React.createElement(Container, { class: 'panel-option' },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(Container, { class: 'panel-value' },
            React.createElement(SelectInput, { class: 'panel-value-select', type: props.selectType, options: props.selectOptions, value: props.selectValue, onChange: (value) => props.setSelectProperty(value) }),
            React.createElement(ColorPicker, { class: 'panel-value-color', value: props.colorValue, onChange: (value) => props.setColorProperty(value) })));
};
export const Slider = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(SliderInput, { class: 'panel-value', min: props.min, max: props.max, sliderMin: props.min, sliderMax: props.max, precision: props.precision, step: props.step ?? 0.01, onChange: (value) => {
                props.setProperty(value);
            }, value: props.value }));
};
export const Numeric = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(NumericInput, { class: 'panel-value', min: props.min, max: props.max, onChange: (value) => {
                props.setProperty(value);
            }, value: props.value }));
};
export const ColorPickerControl = (props) => {
    return React.createElement(Container, { class: 'panel-option', hidden: props.hidden, enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(ColorPicker, { class: 'panel-value', value: props.value, onChange: (value) => props.setProperty(value) }));
};
export const MorphSlider = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'morph-label', flexGrow: '1', flexShrink: '1', text: props.label ? props.label : props.name.substring(0, 1).toUpperCase() + props.name.substring(1, props.name.length), flex: true }),
        React.createElement(SliderInput, { class: 'morph-value', flexGrow: '0', flexShrink: '0', min: props.min, max: props.max, sliderMin: props.min, sliderMax: props.max, precision: props.precision, step: 0.01, onChange: (value) => {
                props.setProperty(value);
            }, value: props.value }));
};
export const Select = (props) => {
    return React.createElement(Container, { class: 'panel-option', enabled: props.enabled ?? true },
        React.createElement(Label, { class: 'panel-label', text: props.label }),
        React.createElement(SelectInput, { class: 'panel-value', type: props.type, options: props.options, value: props.value, onChange: (value) => {
                props.setProperty(value);
            } }));
};
// naked versions
export const NakedSelect = (props) => {
    return React.createElement(SelectInput, { id: props.id, class: props.class, width: props.width, type: props.type, options: props.options, enabled: props.enabled ?? true, value: props.value, onChange: (value) => {
            props.setProperty(value);
        } });
};
export const NakedSlider = (props) => {
    return React.createElement(SliderInput, { id: props.id, class: props.class, width: props.width, min: props.min, max: props.max, sliderMin: props.min, sliderMax: props.max, precision: props.precision, step: 0.01, enabled: props.enabled ?? true, value: props.value, onChange: (value) => {
            props.setProperty(value);
        } });
};
