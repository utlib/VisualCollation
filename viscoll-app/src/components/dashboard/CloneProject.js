import React from 'react';
import {floatFieldLight} from '../../styles/textfield';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';


export default class CloneProject extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      projectIndex: -1
    }
  }

  onChange = (event, projectIndex) => {
    this.setState({ projectIndex });
  }

  submit = (event) => {
    if (event) event.preventDefault();
    this.props.cloneProject(this.props.allProjects[this.state.projectIndex].id);
    this.props.reset();
    this.props.close();
  }

  render(){
    if (this.props.allProjects.length>0) {
      return (
        <div style={{width:"70%", margin:"auto"}}>
          <h1 style={{textAlign: "center"}}>Clone Existing Collation</h1>
          <form onSubmit={this.submit}>
            <SelectField
              aria-label="Choose a collation to clone"
              id="cloneDropDownMenu"
              floatingLabelText="Choose a collation to clone"
              {...floatFieldLight}
              value={this.state.projectIndex}
              onChange={this.onChange}
              fullWidth
              maxHeight={300}
            >
            {this.props.allProjects.map((project, index)=>{
              return (
                <MenuItem 
                  value={index} 
                  primaryText={project.title} 
                  key={project.id} 
                />
              );
            })}
            </SelectField>
            <div style={{textAlign:"center",paddingTop:30}}>
              <FlatButton 
                label="Back"
                aria-label="Back"
                onClick={() => this.props.previousStep()}
              />
              <RaisedButton 
                label="Clone"
                aria-label="Clone"
                primary
                type="submit"
                disabled={this.state.projectIndex<0}
                onClick={() => this.submit(null)}
              />
            </div>
          </form>
        </div>
      );
    } else {
      return <div style={{width:"70%", margin:"auto"}}>
        <h1 style={{textAlign: "center"}}>Clone Existing Collation</h1>
        <p style={{textAlign:"center",paddingTop:"1em"}}>You do not have any projects to clone.</p>
        <div style={{textAlign:"center",paddingTop:30}}>
              <FlatButton 
                label="Back"
                aria-label="Back"
                onClick={() => this.props.previousStep()}
              />
            </div>
      </div>
    }
  }
}
