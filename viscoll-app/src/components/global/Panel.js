import React, {Component} from 'react';
import sidebarStyle from "../../styles/sidebar";
import {Card, CardText, CardHeader} from 'material-ui/Card';

/** Expandable panel component for the project sidebar. Panel examples: Filter, export.. */
export default class Panel extends Component {
  render() {
    return (
      <Card 
        expandable={true} 
        initiallyExpanded={this.props.defaultOpen} 
        style={sidebarStyle.panel.main}
      >
        <CardHeader
          titleColor="white"
          title={this.props.title}
          showExpandableButton={true}
          titleStyle={sidebarStyle.panel.title}
          actAsExpander={true}
          iconStyle={{color:"white"}}
        />
        <CardText 
          color="white"
          expandable={true} 
          style={sidebarStyle.panel.text}
        >
          {this.props.children}
        </CardText>
      </Card>
    )
  }

}
