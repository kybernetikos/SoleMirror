(function() {
	var global = this;
	if (global.SoleMirror) {
		global.soleMirrorDiv.style.display = global.soleMirrorVisible ? 'none' : 'block';
		global.soleMirrorVisible = ! global.soleMirrorVisible;
	} else {
		var css = document.createElement('link');
		css.setAttribute('rel', 'stylesheet');
		css.setAttribute('href', 'http://kybernetikos.github.com/SoleMirror/combined/combined.css');
		document.head.appendChild(css);
		var js = document.createElement('script');
		js.setAttribute('src', 'http://kybernetikos.github.com/SoleMirror/combined/combined.js');
		js.onload = function() {
			var console = document.createElement('div');
			console.setAttribute('id', 'SoleMirror');
			document.body.appendChild(console);
			global.con = new SoleMirror(console);
			global.soleMirrorDiv = console;
			global.soleMirrorVisible = true;
		};
		document.head.appendChild(js);
	}
})();