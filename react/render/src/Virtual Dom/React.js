import {ReactElement} from './element';
import ReactComponent from './ReactComponent';

var createElement = ReactElement.createElement;
var React = {
    Component: ReactComponent,
    //PureComponent: ReactPureComponent,

    createElement: createElement,



};

export default React;