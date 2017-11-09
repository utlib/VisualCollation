import React from 'react';
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
    event.preventDefault();
    this.props.cloneProject(this.props.allProjects[this.state.projectIndex].id);
    this.props.reset();
    this.props.close();
  }

  render(){
    return (
      <div style={{width:"70%", margin:"auto"}}>
        <h1 style={{textAlign: "center"}}>Clone Existing Collation</h1>
        <form onSubmit={this.submit}>
          <SelectField
            floatingLabelText="Choose a collation to clone"
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
                onTouchTap={this.props.previousStep}  
            />
            <RaisedButton 
              label={"Clone"}
              primary
              type="submit"
              disabled={this.state.projectIndex<0}
            />
          </div>
        </form>
      </div>
    );
  }
}
