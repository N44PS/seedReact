/** @jsx React.DOM */

var React = require('react');

module.exports = Download = React.createClass({
  units:['o','Ko','Mo','Go'],
  properUnit:function(val,rate){
  	var i=0, rate = rate ? "/s" : "";

  	if(val==0)
  		return "•";

  	while(val>1000){
  		val=val/1000;
  		i++;
  	}

  	return val.toFixed(1) + " " + this.units[i] + rate;
  },
  action:function(){
    var socket=this.props.socket, status = this.props.download.status;
    if(status!=="seeding"&&status!=="error")
      socket.emit('change', {id: this.props.download.id, status: this.props.download.status });
    else
      socket.emit('delete', {id: this.props.download.id});
  },
  render: function(){
    var download = this.props.download,
    style = {'width':((download.rx_bytes*100)/download.size).toFixed(1)+"%"},
    progress;
    if(download.status !== "seeding")
      progress=<div className="download__progress"><span className={"download__current download__current--"+download.status} style={style}></span></div>;
    return (
      <article className={"download download--"+download.status}>
        <div onClick={this.action} className={"icon icon--" + download.status}></div>
        <div className="download__attr download__title">
          <strong>{download.name}</strong>
          {progress}
        </div>
        <div className="download__attr download__rate">{this.properUnit(download.rx_rate,true)}</div>
        <div className="download__attr">{this.properUnit(download.tx_rate,true)}</div>
        <div className="download__attr">
          <div>{this.properUnit(download.rx_bytes)}</div>
          <div>{this.properUnit(download.tx_bytes)}</div>
        </div>
        <div className="download__attr download__percentage">
          <div><strong>{+(download.rx_pct/100).toFixed(1)} %</strong></div>
          <div>{this.properUnit(download.size)}</div>
        </div>
      </article>
    )
  }
});