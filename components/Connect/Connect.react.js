/** @jsx React.DOM */

var React = require('react');
var Item = require('./Item.react.js');

module.exports = Connect = React.createClass({
  getInitialState: function(props){

    props = props || this.props;
    return {
      user: props.user,
      socket: this.socket
    };

  },
  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },
  componentDidMount: function(){
  	this.socket = io.connect();
    this.setState({socket: this.socket});
  },
  render: function(){
  	var self = this;
  	var content = this.props.users.map(function(user,i){
      return (
        <Item key={user.id} selectUser={self.selectUser} user={user} socket={self.state.socket} />
      )
    });
    return (
        <ul className="connect">
        	{content}
        </ul>
    )
  }
}); 