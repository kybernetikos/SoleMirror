(function() {
	var css = document.createElement('link');
	css.setAttribute('rel', 'stylesheet');
	css.setAttribute('href', 'http://kybernetikos.github.com/SoleMirror/combined/combined.css');
	document.head.appendChild(css);
	var js = document.createElement('script');
	js.setAttribute('src', 'http://kybernetikos.github.com/SoleMirror/combined/combined.js');
	document.head.appendChild(js);
	var open = document.createElement('script');
	open.innerText = "var con = new SoleMirror();";
	document.head.appendChild(open);
})();