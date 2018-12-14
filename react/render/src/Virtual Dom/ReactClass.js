
import ReactComponent from './ReactComponent';
var ReactClassComponent = function () {};
Object.assign(ReactClassComponent.prototype, ReactComponent.prototype);
var ReactClass = {
	createClass : function(spec){
		 var Constructor = function (props) {
		 	this.props = props;
		 	this.state = this.getInitialState ? this.getInitialState() : null;
		 }
		 Constructor.prototype = new ReactClassComponent();
    	 Constructor.prototype.constructor = Constructor;

    	 Object.assign(Constructor.prototype, spec);
    	 return Constructor;
	}
}

export default ReactClass;