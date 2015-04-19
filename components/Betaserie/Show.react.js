/** @jsx React.DOM */

var React = require('react');
var Episode = require('./Episode.react.js');

module.exports = Show = React.createClass({
  render: function(){
    var self = this;
  	var episodes = this.props.episodes.map(function(episode){
      return (
        <Episode key={episode.id + "_" + episode.code} title={self.props.title} code={episode.code} socket={self.props.socket} />
      )
    });

    return (
      <ul className="show__episodes">
      	{episodes}
      </ul>
    )
  }
});