/**
The Help Text Viewer provides the possibility to enhance your forms by adding help buttons.
These buttons display a help message when clicked or hovered. 

Optionally, the buttons can be hidden by default, with a global switch (the Help Text Trigger) to show or hide them. 
*/
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "mxui/dom",
    "dojo/_base/lang",
    "dojo/html",
	"dojo/dom-style",
	"dojo/_base/window",
	"dojo/query",
	"dojo/topic",
	"dojo/dom-geometry"
], function (declare, _WidgetBase, dom, lang, html, domStyle, win, query, topic, domGeom) {
    'use strict';

    return declare('ManTooltip.widget.ManTooltip', [ _WidgetBase ], {
		
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
	
	log() {
		var args = Array.prototype.slice.call(arguments);
		if (this.id) {
			args.unshift(this.id);
		}
		if (mx && mx.logger && mx.logger.debug) {
			mx.logger.debug.apply(mx.logger, args);
		} else {
			logger.debug.apply(logger, args);
		}
	},

	warn() {
		var args = Array.prototype.slice.call(arguments);
		if (this.id) {
			args.unshift(this.id);
		}
		if (mx && mx.logger && mx.logger.warn) {
			mx.logger.warn.apply(mx.logger, args);
		} else {
			logger.warn.apply(logger, args);
		}
	},

	postCreate : function(){
		this.log(".postCreate");

		//img node
		this.imgNode = dom.create("div", {
			'class' : 'text-info ManTooltipButton glyphicon glyphicon-info-sign'
		});
		this.domNode.appendChild(this.imgNode);
		this.connect(this.imgNode, 'onclick', lang.hitch(this, this.toggleHelp, true));
		
		if (this.showonhover) {
			this.connect(this.imgNode, 'onmouseenter', lang.hitch(this, this.showHelp, true, false));
			this.connect(this.imgNode, 'onmouseleave', lang.hitch(this, this.showHelp, false, false));
		}
		
		//help node
		this.createHelp();
		
		//this.stateChange(this.startvisible);
		this.handle = topic.subscribe(this.topic, this, this.stateChange);

		this.handle.remove();
	},

	stateChange : function(newstate) {
		if (newstate)
		domStyle.set(this.imgNode, "display", "block")
	},
	
	createHelp : function () {
		this.helpNode = dom.create("div", {'class' : 'ManTooltipBox label label-primary'});
		domStyle.set(this.helpNode, 'display', 'none');
		var input = this.text.replace(/\n/g, '<br />');
		html.set(this.helpNode, input);
		domStyle.set(this.helpNode, {
			'width' : this.width + 'px',
			'maxHeight' : this.height + 'px'
		});
		this.connect(this.helpNode, 'onclick', lang.hitch(this, this.toggleHelp, true));
		//document.body.appendChild(this.helpNode);
		if (this.position == 'popup')
			win.body().appendChild(this.helpNode);
		else {
			this.domNode.appendChild(this.helpNode);
			domStyle.set(this.domNode, 'position', 'relative');
		}
	},

	toggleHelp : function(clicked, e) {
		this.helpvisible = !this.helpvisible;
		this.showHelp(this.helpvisible, clicked);
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
	},
	
	windowClick : function () {
		if (this.windowEvt) {
			this.disconnect(this.windowEvt);
			this.windowEvt = null;
		}
		this.helpvisible = false;
		domStyle.set(this.helpNode, 'display', 'none');
	},
	
	showHelp : function(show, clicked) {
		if (show || this.helpvisible) {
			if (this.closeClick && clicked && show)
				this.windowEvt = this.connect(document.body, 'onclick', this.windowClick);

			if (this.position == 'popup') {
				var coords = domGeom.position(this.imgNode, true);
				domStyle.set(this.helpNode, {
					'display' : 'block',
					'top' : (coords.y + 30)+'px',
					'left': (window.innerWidth < coords.x + 30 + this.width ? coords.x - this.height - 30 : coords.x + 30)+'px'
				});
			}
			else {
				domStyle.set(this.helpNode, {
					'display' : 'block',
					'top' : '30px',
					'left': this.position == 'right' ? '30px' : (-30 - this.width) + 'px'
				});
			}

			var currentNode = this.helpNode;
			var self = this;

			query('div[class^=mx-name-ManTooltip').forEach(function(node) {
				var widget = dijit.registry.getEnclosingWidget(node);
				if (widget != self) {
					widget.helpvisible = false;
				}
			});

			query('.ManTooltipBox:style="display:block"').forEach(function(node) {
				if (node != currentNode) {
					domStyle.set(node, {
						'display' : 'none'
					});
				}
			});
		}
		else {
			this.helpvisible = false;
			domStyle.set(this.helpNode, 'display', 'none');
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
				this.log(".uninitialize");
			}
			if (this.helpNode != null)
				document.body.removeChild(this.helpNode);
			if (this.handle != null)
			topic.unsubscribe(this.handle);
		}
		catch(e) {
			this.warn("error on helptextviewer unload: " + e);
		}
	}
		});
	});

require([ "ManTooltip/widget/ManTooltip" ]);
