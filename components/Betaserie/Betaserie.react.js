/** @jsx React.DOM */

var React = require('react');
var Show = require('./Shows.react.js');

module.exports = Betaserie = React.createClass({
  getInitialState: function(props){
    props = props || this.props;
    return {
      users: props.users
    };
  },
  componentWillReceiveProps: function(newProps, oldProps){
    this.setState(this.getInitialState(newProps));
  },
  componentDidMount: function(){
    var self = this;
    this.setState({socket: io.connect()});
    this.state.socket.on('gotUsers', function (users) {
        self.setState({users: users});
    });
  },
  changeUser: function(user, event){
    var users = document.getElementsByClassName("user"), 
        names = document.getElementsByClassName("account__user"), 
        selected_user = document.getElementsByClassName("user--" + user),
        selected_name = document.getElementsByClassName("account__user--" + user);
    [].forEach.call(users, function (user) {
      user.classList.remove("user--selected");
    });
    [].forEach.call(names, function (name) {
      name.classList.remove("account__user--selected");
    });
    selected_user[0].classList.add("user--selected");
    selected_name[0].classList.add("account__user--selected");
  },
  render: function(){
    var self = this;
    var users = this.state.users.map(function(user,i){
      classe = i == 0 ? " user--selected" : "";
      return (
        <article className={"user user--" + user.name + classe} key={user.name}>
            <Shows shows={user.shows} socket={self.state.socket} />
        </article>
      )
    });
    var names = this.state.users.map(function(user,i){
      classe = i == 0 ? " account__user--selected" : "";
      return (
        <li onClick={self.changeUser.bind(null, user.name)} className={"account__user account__user--" + user.name + classe} key={user.name}>
            {user.name}
        </li>
      )
    });

    return (
      <aside className="betaserie">
      	<ul className="account">
      		{names}
      	</ul>
        <div className="users">
        	{users}
        </div>
      </aside>
    )

  }

}); 