var SoleMirror = (function() {
	
	function Block(previous, cnsole, txt) {
		this.previous = previous;
		this.next = null;
		this.element = document.createElement('div');
		var editorDiv = document.createElement('div');
		this.result = document.createElement('div');
		this.result.className = "output";
		var pointer = this;
		var savedText = "";
		CodeMirror.commands.autocomplete = function(cm) {
			CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
		};
		this.editor = CodeMirror(editorDiv, {
		  value: txt,
		  mode:  "javascript",
		  extraKeys: {
			"Ctrl-Enter": function() {
				this.clear();
				cnsole.setOutputBlock(this);
				var js = this.editor.getValue();
				try {
					with ({}) {
						var result = eval(js);
					}
					cnsole.log("> ", result);
				} catch (e) {
					cnsole.log(e);
				}
				cnsole.onExec(js);
				if (this == cnsole.bottomBlock) {
					cnsole.addBlock(this);
				}
			}.bind(this),
			"Ctrl-Up": function() {
				if (pointer == this) {
					savedText = this.editor.getValue();
				}
				if (pointer.previous != null) {
					pointer = pointer.previous;
					if (pointer == this) {
						this.editor.setValue(savedText);
					} else {
						this.editor.setValue(pointer.editor.getValue());
					}
					this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
				}
			}.bind(this),
			"Ctrl-Down": function() {
				if (pointer == this) {
					savedText = this.editor.getValue();
				}
				if (pointer.next != null) {
					pointer = pointer.next;
					if (pointer == this) {
						this.editor.setValue(savedText);
					} else {
						this.editor.setValue(pointer.editor.getValue());
					}
					this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
				}
			}.bind(this),
			"Ctrl-Space": "autocomplete"
		  }
		});
		this.element.appendChild(editorDiv);
		this.element.appendChild(this.result);
	}

	Block.prototype.getElement = function() {
		return this.element;
	};

	Block.prototype.onAdded = function() {
		this.editor.refresh();
		this.editor.focus();
		this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
	};

	Block.prototype.output = function(element) {
		this.result.appendChild(element);
	};

	Block.prototype.clear = function() {
		this.result.innerHTML = "";
	}

	function SoleMirror(container, txt) {
		var previousFake = null;
		// load from localstorage
		var previousHistory = localStorage.getItem('console-history');
		if (previousHistory) {
			previousHistory = JSON.parse(previousHistory);
			function makeFake(str, previous) {
				return {
					editor: { getValue: function() {return str;}},
					next: null,
					previous: previous
				};
			};
			if (previousHistory.length > 0) {
				previousFake = makeFake(previousHistory[0]);	
				for (var i=1; i < previousHistory.length; ++i) {
					var nxtFake = makeFake(previousHistory[i], previousFake);
					previousFake.next = nxtFake;
					previousFake = nxtFake;
				}
			}
		}
		
		this.bottomBlock = null;
		this.outputBlock = null;
		this.container = container || document.body;
		this.log = this.log.bind(this);
		var initialCode = txt || "/* Control-enter to execute,\n   control-up and control-down to scroll through history\n   control-space to autocomplete */\ncon.log('hello soleMirror');";
		this.addBlock(previousFake, initialCode);
	}

	SoleMirror.prototype.renderError = function(e) {
		var stack = e.stack;
		var element = document.createElement('pre');
		element.className = 'error';
		element.textContent = stack;
		return element;
	};

	SoleMirror.prototype.renderObject = function(obj) {

		function renderObjectPart(key, objPart) {
			var element = document.createElement('li');
			if (objPart == null || typeof objPart != 'object') {
				element.innerText = (key !== null ? (key + " : ") : "") + objPart;
				if (objPart == null) {
					element.style.color = "#999";
				}
			} else if (typeof objPart == 'object') {
				var children = null;
				var json = JSON.stringify(objPart);
				var display = json.substring(0, 30);
				if (display != json) display = display+"...";
				element.innerText = (key !== null ? (key + " : ") : "") + display;
				element.onclick = function(evt) {
					evt.stopPropagation();
					if (children == null) {
						children = document.createElement('ul');
						for (var key in objPart) {
							children.appendChild(renderObjectPart(key, objPart[key]));
						}
						element.appendChild(children);
					} else {
						element.removeChild(children);
						children = null;
					}
				}
			}
			return element;
		}
		var el = document.createElement('ul');
		el.className = 'objectbrowser';
		el.appendChild(renderObjectPart(null, obj));
		return el;
	}

	SoleMirror.prototype.render = function(obj) {
		if (obj instanceof Error) {
			return this.renderError(obj);
		} else if (obj instanceof HTMLElement) {
			var element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.style.color = '#909';
			var txt = "<" + obj.tagName.toLowerCase();
			if (obj.id) txt+=" id='"+obj.id+"'";
			if (obj.className) txt+=" class='"+obj.className+'"';
			element.textContent = txt+" >";
			var children = document.createElement('div');
			children.style.fontSize = 'small';
			children.style.paddingLeft = '20px';
			element.appendChild(children);
			var visible = false;
			children.style.display = 'none';
			children.innerText = obj.innerHTML;
			element.onclick = function() {
				visible = ! visible;
				children.style.display = visible ? 'block' : 'none'; 
			};
			return element
		} else if (obj == null || typeof (obj) != 'object') {
			var element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.textContent = "" + obj;
			if (obj == null) {
				element.style.color = "#999";
			}
			return element
		} else {
			return this.renderObject(obj);
		}
	};

	SoleMirror.prototype.log = function() {
		var line = document.createElement('div');
		line.style.position = 'relative';
		for (var i = 0; i < arguments.length; ++i) {
			line.appendChild(this.render(arguments[i]));
		}
		this.outputBlock.output(line);
	};

	SoleMirror.prototype.setOutputBlock = function(block) {
		this.outputBlock = block;
	}

	SoleMirror.prototype.addBlock = function(previous, txt) {
		var block = new Block(previous, this, txt);
		if (previous != null) previous.next = block;
		this.setOutputBlock(block);
		this.bottomBlock = block;
		this.container.appendChild(block.getElement());
		block.onAdded();
		return block;
	};

	SoleMirror.prototype.onExec = function() {
		// save everything to localstorage
		var toSave = [];
		var historyLength = 20;
		var current = this.bottomBlock;
		for (var i = 0; i < historyLength; ++i) {
			var val = current.editor.getValue();
			if (val != null && val.length > 0) {
				toSave.unshift(val);
			}
			current = current.previous;
			if (current == null) break;
		}
		localStorage.setItem('console-history', JSON.stringify(toSave));
	};
	
	return SoleMirror;
})();