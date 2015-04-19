/** @jsx React.DOM */

var React = require('react');

module.exports = Menu = React.createClass({
  modes: ["slow","normal"],
  getInitialState: function(props){

    props = props || this.props;
    return {
      mode: 0
    };

  },
  componentDidMount: function(){
  	var self = this;
  	this.socket = io.connect();
  	this.socket.on('speedChanged', function(){
  		self.setState({mode: self.state.mode ? 0 : 1}, function(a,b,c){
	  		console.log("change state",a,b,c);
  		});
  	});
  },
  reboot: function(){
  	this.socket.emit('reboot');
  },
  changeSpeed: function(){
  	mode = this.state.mode ? 0 : 1;
  	var speed = {
  		"throttling" : this.modes[mode]
  	};
  	console.log(this.modes[mode]);
  	this.socket.emit('changeSpeed',speed);
  },
  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },
  render: function(){
    return (
      <nav className="menu">
      	<div className="menu__button menu__button--speed" onClick={this.changeSpeed}>
      		<div className={"menu__button__switch " + "menu__button__switch--"+this.modes[this.state.mode]}></div>
      	</div>
      	<div className="menu__button menu__button--wifi"></div>
      	<div className="menu__button menu__button--reboot" onClick={this.reboot}></div>
      </nav>
    )
  }
}); 