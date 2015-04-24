/** @jsx React.DOM */

var React = require('react');
var Downloads = require('./Downloads.react.js');

module.exports = Seed = React.createClass({
  socket:'',
  getInitialState: function(props){
    props = props || this.props;
    return {
      downloads: props.downloads
    };
  },
  componentDidMount: function(){
    var self = this;
    this.socket = io.connect();
    this.socket.on('downloads', function (data) {
      if(data){
        downloads = data.sort(function(a,b){
          if(a.created_ts>b.created_ts){
            if(a.status === b.status)
              return -1;
            else{
              if(a.status==="seeding")
                return 1;
              else
                return -1;
            }
          }else{
            return 1;
          }
        });
        self.setState({downloads: downloads});
      }
    });
  },
  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },
  render: function(){
    return (
        <Downloads downloads={this.state.downloads} socket={this.socket} />
    )
  }
}); 