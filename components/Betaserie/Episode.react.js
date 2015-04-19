/** @jsx React.DOM */

var React = require('react');

module.exports = Episode = React.createClass({
  gotSocket: false,
  clicked: false,
  getInitialState: function(props){

    props = props || this.props;
    return {
      res: props.res
    };

  },
  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },
  getTorrent: function(){
    if(!this.clicked){
      key = this.props.key;
      this.clicked=true;
      this.setState({res: "searching"});
      this.socket.emit('getTorrent', {name: this.props.title + " " + this.props.code, key:key});
    }
  },
  componentDidUpdate: function(){
    if(!this.gotSocket){
      var self = this;
      this.socket = this.props.socket;
      this.socket.on('changeState'+this.props.key, function (data) {
          self.setState({res: data});
      });
      this.gotSocket=true;
    }
  },
  render: function(){
    var classeEpisode = this.state.res ? " episode--" + this.state.res : "",
    classeState = this.state.res ? " icon--" + this.state.res : " icon--toadd";
    return (
     	<li key={this.props.key} className={"episode" + classeEpisode}>
            <div className={"icon"+classeState} onClick={this.getTorrent}></div>
            <h3 className="episode__name">{this.props.code}</h3>
      </li>
    )
  }

}); 