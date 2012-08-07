(function() {
	var global = this;
	var css = document.createElement('link');
	css.setAttribute('rel', 'stylesheet');
	css.setAttribute('href', 'http://kybernetikos.github.com/SoleMirror/combined/combined.css');
	document.head.appendChild(css);
	var js = document.createElement('script');
	js.setAttribute('src', 'http://kybernetikos.github.com/SoleMirror/combined/combined.js');
	js.onload = function() {
		global.con = new SoleMirror();
	};
	document.head.appendChild(js);
})();