/** @jsx React.DOM */

var React = require('react');
var Seed = require('./components/Seedbox/Seed.react');
var Betaserie = require('./components/Betaserie/Betaserie.react');
var Menu = require('./components/Menu/Menu.react');

// Snag the initial state that was passed from the server side
var downloads = JSON.parse(document.getElementById('downloads').innerHTML);
var users = JSON.parse(document.getElementById('users').innerHTML);
// Render the components, picking up where react left off on the server
React.renderComponent(
	<div className="app">
  		<Menu />
  		<Betaserie users={users} />
  		<Seed downloads={downloads} />
  	</div>,
  document.getElementById('app')
);
