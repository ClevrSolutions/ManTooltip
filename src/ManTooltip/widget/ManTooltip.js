/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
dojo.provide("ManTooltip.widget.ManTooltip");

mendix.widget.declare('ManTooltip.widget.ManTooltip', {
		
	inputargs: {
		text : '',
		showonhover : true,
		width : 300,
		height : 300,
		closeClick : false,
		position : 'popup'
	},
	
	//IMPLEMENTATION
	domNode: null,
	topic : "CustomWidget/ManTooltip",
	imgNode : null,
	handle : null,
	helpNode : null,
	helpvisible: false,
	windowEvt : null,
	
  postCreate : function(){
		logger.debug(this.id + ".postCreate");

		//img node
		this.imgNode = mendix.dom.div({
			'class' : 'text-info ManTooltipButton glyphicon glyphicon-info-sign'
		});
		this.domNode.appendChild(this.imgNode);
		this.connect(this.imgNode, 'onclick', dojo.hitch(this, this.toggleHelp, true));
		
		if (this.showonhover) {
			this.connect(this.imgNode, 'onmouseenter', dojo.hitch(this, this.showHelp, true, false));
			this.connect(this.imgNode, 'onmouseleave', dojo.hitch(this, this.showHelp, false, false));
		}
		
		//help node
		this.createHelp();
		
		//this.stateChange(this.startvisible);
		this.handle = dojo.subscribe(this.topic, this, this.stateChange);
		
		this.actLoaded();
	},

	stateChange : function(newstate) {
		if (newstate)
			dojo.style(this.imgNode, "display", "block")
	},
	
	createHelp : function () {
		this.helpNode = mxui.dom.div({'class' : 'ManTooltipBox label label-primary'});
		dojo.style(this.helpNode, 'display', 'none');
		var input = this.text.replace(/\n/g, '<br />');
		dojo.html.set(this.helpNode, input);
		dojo.style(this.helpNode, {
			'width' : this.width + 'px',
			'maxHeight' : this.height + 'px'
		});
		this.connect(this.helpNode, 'onclick', dojo.hitch(this, this.toggleHelp, true));
		//document.body.appendChild(this.helpNode);
		if (this.position == 'popup')
			dojo.body().appendChild(this.helpNode);
		else {
			this.domNode.appendChild(this.helpNode);
			dojo.style(this.domNode, 'position', 'relative');
		}
	},

	toggleHelp : function(clicked, e) {
		this.helpvisible = !this.helpvisible;
		this.showHelp(this.helpvisible, clicked);
		if (e)
			dojo.stopEvent(e);
	},
	
	windowClick : function () {
		if (this.windowEvt) {
			this.disconnect(this.windowEvt);
			this.windowEvt = null;
		}
		this.helpvisible = false;
		dojo.style(this.helpNode, 'display', 'none');
	},
	
	showHelp : function(show, clicked) {
		if (show || this.helpvisible) {
			if (this.closeClick && clicked && show)
				this.windowEvt = this.connect(document.body, 'onclick', this.windowClick);

			if (this.position == 'popup') {
				var coords = dojo.coords(this.imgNode, true);
				dojo.style(this.helpNode, {
					'display' : 'block',
					'top' : (coords.y + 30)+'px',
					'left': (window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30)+'px'
				});
			}
			else {
				dojo.style(this.helpNode, {
					'display' : 'block',
					'top' : '30px',
					'left': this.position == 'right' ? '30px' : (-30 - this.width) + 'px'
				});
			}

			var currentNode = this.helpNode;
			var self = this;

			dojo.query('div[class^=mx-name-ManTooltip').forEach(function(node) {
				var widget = dijit.registry.getEnclosingWidget(node);
				if (widget != self) {
					widget.helpvisible = false;
				}
			});

			dojo.query('.ManTooltipBox:style="display:block"').forEach(function(node) {
				if (node != currentNode) {
					dojo.style(node, {
						'display' : 'none'
					});
				}
			});
		}
		else {
			this.helpvisible = false;
			dojo.style(this.helpNode, 'display', 'none');
		}
	},
	
	suspended : function() {
		if (this.windowEvt != null) {
			this.disconnect(this.windowEvt);
			this.windowEvt = null;
		}
		this.showHelp(false);
	},
	
	uninitialize : function() {
		
		try {
			if (this.windowEvt != null) {
				this.disconnect(this.windowEvt);
				this.windowEvt = null;
				logger.debug(this.id + ".uninitialize");
			}
			if (this.helpNode != null)
				document.body.removeChild(this.helpNode);
			if (this.handle != null)
				dojo.unsubscribe(this.handle);
		}
		catch(e) {
			logger.warn("error on helptextviewer unload: " + e);
		}
	}
});