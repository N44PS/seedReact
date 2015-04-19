/** @jsx React.DOM */

var React = require('react');
var Download = require('./Download.react.js');

module.exports = Downloads = React.createClass({

  // Render our downloads
  render: function(){
    var self = this;
    // Build list items of single download components using map
    if(this.props.downloads!==1)
    var content = this.props.downloads.map(function(download,i){
      return (
        <Download key={download.id} download={download} socket={self.props.socket} />
      )
    });

    // Return ul filled with our mapped downloads
    return (
      <section className="seed">
        <div className="seed__downloads">
          <header className="seed__titles">
            <h3 className="seed__title"></h3>
            <h3 className="seed__title">Name</h3>
            <h3 className="seed__title">Downloading</h3>
            <h3 className="seed__title">Uploading</h3>
            <h3 className="seed__title">Transfered</h3>
            <h3 className="seed__title">Size</h3>
          </header>
          {content}
        </div>
      </section>
    )

  }

}); 