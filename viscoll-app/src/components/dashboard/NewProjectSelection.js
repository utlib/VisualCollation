import React from 'react';
import {Card, CardText} from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import AddIcon from 'material-ui/svg-icons/content/add';
import CopyIcon from 'material-ui/svg-icons/content/content-copy';
import ImportIcon from 'material-ui/svg-icons/action/system-update-alt';

const NewProjectSelection = (props) => {
  return (
    <div style={{width:"100%", margin:"auto"}} className="newProjectSelection">
      <Card 
        style={{padding:0,margin:0}}
        containerStyle={{padding:0,margin:0}}
        onTouchTap={()=>props.setProjectType("new")}  
      >
        <CardText style={{padding:0,margin:0}}>
          <div className="selectItem">
            <div className="icon">
              <IconButton iconStyle={{color:"#3A4B55",width:30, height:30, marginTop:-10}}>
                <AddIcon />
              </IconButton>
            </div>
            <div className="text">
              <h1>Create new</h1>
              <h2>Create a new collation from scratch</h2>
            </div>
          </div>
        </CardText>
      </Card>
      <br />
      <Card 
        style={{padding:0,margin:0}}
        containerStyle={{padding:0,margin:0}}
        onTouchTap={()=>props.setProjectType("import")}  
      >
        <CardText style={{padding:0,margin:0}}>
          <div className="selectItem">
            <div className="icon">
              <IconButton iconStyle={{color:"#3A4B55",width:30, height:30, marginTop:-10}}>
                <ImportIcon />
              </IconButton>
            </div>
            <div className="text">
              <h1>Import</h1>
              <h2>Import a collation from VisColl XML, JSON or formula</h2>
            </div>
          </div>
        </CardText>
      </Card>
      
      <br />
      <Card 
        style={{padding:0,margin:0}}
        containerStyle={{padding:0,margin:0}}
        onTouchTap={()=>props.setProjectType("clone")}  
      >
        <CardText style={{padding:0,margin:0}}>
          <div className="selectItem">
            <div className="icon">
              <IconButton iconStyle={{color:"#3A4B55",width:30, height:30, marginTop:-10}}>
                <CopyIcon />
              </IconButton>
            </div>
            <div className="text">
              <h1>Clone existing</h1>
              <h2>Clone one of your existing collations</h2>
            </div>
          </div>
        </CardText>
      </Card>
    </div>
  );
}
export default NewProjectSelection;