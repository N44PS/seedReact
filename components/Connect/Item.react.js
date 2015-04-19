/** @jsx React.DOM */

var React = require('react');

module.exports = Item = React.createClass({
  selectUser: function(){
  	socket = this.props.socket;
  	socket.emit('selectedUser',this.props.user);
  },
  render: function(){
    return (
        <li onClick={this.selectUser}>{this.props.user.name}</li>
    )
  }
}); 