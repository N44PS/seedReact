/** @jsx React.DOM */

var React = require('react');
var Show = require('./Show.react.js');

module.exports = Shows = React.createClass({
  render: function(){
    var self = this;
    var shows = this.props.shows.map(function(show,i){
      return (
        <article className="show" key={show.id}>
            	<h2 className="show__title">{show.title}</h2>
              <Show episodes={show.unseen} title={show.title} socket={self.props.socket} />
        </article>
      )
    });

    return (
        <div className="shows">
          {shows}
        </div>
    )

  }

}); 