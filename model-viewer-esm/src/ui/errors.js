import React from 'react';
import { InfoBox } from 'pcui';
// InfoBox that shows an error
const ErrorBox = (props) => {
    return React.createElement(InfoBox, { class: "pcui-error", title: 'Error', hidden: !props.observerData.ui.error, text: props.observerData.ui.error, icon: 'E218' });
};
export default ErrorBox;
