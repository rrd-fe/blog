
function ReactDOMTextComponent(text){
	this._currentElement = "" + text;;
	this._rootNodeID = null;
}

ReactDOMTextComponent.prototype.mountComponent = function(rootID){
	this._rootNodeID = rootID;
	return (
	    '<span data-reactid="' + rootID + '">' + this._currentElement + "</span>"
	);
}


export default ReactDOMTextComponent;