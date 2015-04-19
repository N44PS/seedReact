/** @jsx React.DOM */

var React = require('react');
var SeedApp = require('./components/SeedApp.react');

// Snag the initial state that was passed from the server side
var downloads = JSON.parse(document.getElementById('downloads').innerHTML)

// Render the components, picking up where react left off on the server
React.renderComponent(
  <SeedApp downloads={downloads} />,
  document.getElementById('seed-app')
);