import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';

export default class PageNotFound extends Component {
  render() {
    return <div className="fourOhFour">
      <div className="container">
        <h1>404!</h1>
        <p>Well, this isn't where you parked your car.</p>
        <a href="/dashboard">
        <RaisedButton 
          label="Go home"
          secondary
          onClick={()=>this.props.history.push("/dashboard")}
        /></a>
      </div>
    </div>
  }
}