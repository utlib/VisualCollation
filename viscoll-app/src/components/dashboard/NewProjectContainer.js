import React from 'react';
import Dialog from 'material-ui/Dialog';
import NewProjectSelection from './NewProjectSelection';
import ProjectDetails from './ProjectDetails';
import ProjectStructure from './ProjectStructure';
import ImportProject from './ImportProject';
import CloneProject from './CloneProject';

export default class NewProjectContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectType: "",
      step: 1,
      title: "",
      shelfmark: "",
      date: "",
      quireNo: 1,
      leafNo: 10,
      conjoined: true,
      collationGroups: [],
      errors: {
        title: "",
        shelfmark: "",
        date: "",
      },
    };
  }
  
  set = (name, value) => {
    this.setState({[name]: value}, () => {
      this.setState({errors:{...this.state.errors, ...this.checkValidationError(name)}});
    });
  }

  reset = () => {
    this.setState({
      projectType:"", 
      step:1,
      title: "",
      shelfmark: "",
      date: "",
      quireNo: 1,
      leafNo: 10,
      conjoined: true,
      collationGroups: [],
      errors: {
        title: "",
        shelfmark: "",
        date: "",
      },
    });
  }



  /**
   * Validate user input and display appropriate error message
   * @param {string} type text field name
   * @public
   */
  checkValidationError = (type) => {
    const errors = {};
    this.props.allProjects.forEach(project => {
      if (type==="title") {
        if (project.title === this.state.title) {
          errors.title = "Project title should be unique";
        } else if (!this.state.title) {
          errors.title = "Project title is required";
        }
      } else if (type==="shelfmark") {
        if (project.shelfmark === this.state.shelfmark) {
          errors.shelfmark = "Manuscript shelfmark should be unique";
        } else if (!this.state.shelfmark) {
          errors.shelfmark = "Manuscript shelfmark is required";
        }
      }
    });
    if (Object.keys(errors).length===0) {
      errors[type] = "";
    }
    return errors;
  }
  /**
   * Return true if any errors exist in the project form
   * @public
   */
  doErrorsExist = () => {
    if (this.state.errors.title)
      return true;
    if (this.state.errors.shelfmark)
      return true;
    for (let group in this.state.collationGroups) {
      if (!this.state.collationGroups[group].leaves && this.state.step===2) return true;
    }
    if (!this.state.title && this.state.step===1)
      return true;
    if (!this.state.shelfmark && this.state.step === 1)
      return true;
    return false;
  }

  /**
   * Remove a group 
   * @param {number} groupNo group number
   * @public
   */
  handleRemoveCollationGroupRow = (groupNo) => {
    let newCollationGroups = [];
    this.state.collationGroups.forEach((group) => {
      if (group.number < groupNo) {
        newCollationGroups.push(group);
      } else if (group.number > groupNo) {
        newCollationGroups.push({...group, number: group.number-1})
      }
    });
    this.setState({ collationGroups: newCollationGroups });
  }

  /**
   * Add a new group 
   * @public
   */
  handleAddNewCollationGroupRow = () => {
    let newCollationGroups = [].concat(this.state.collationGroups);
    for (let i=0; i<parseInt(this.state.quireNo, 10); i++) {
      newCollationGroups.push({number: newCollationGroups.length+1, leaves: this.state.leafNo, conjoin: this.state.conjoined, oddLeaf: 1});
    }
    this.setState({ collationGroups: newCollationGroups });
  }

  /**
   * Update a group 
   * @param {object} event
   * @param {object} updatedGroup
   * @param {string} field
   * @param {string} value
   * @public
   */
  onInputChangeCollationGroupsRows = (event, updatedGroup, field, value) => {
    let newCollationGroups = [];
    this.state.collationGroups.forEach((group, i) => {
      if (updatedGroup.number === i+1) {
        updatedGroup = {...group};
        if (field==="oddLeaf") {
          updatedGroup[field] = value;
        } else if (field==="leaves"){
          updatedGroup[field] = parseInt(event.target.value, 10);
          if (updatedGroup[field] < updatedGroup["oddLeaf"]) {
            updatedGroup["oddLeaf"] = 1;
          }
          if (updatedGroup[field]===1) {
            updatedGroup["conjoin"]=false;
          }
        }
        newCollationGroups.push(updatedGroup);
      } else {
        newCollationGroups.push(group);
      }
    });
    this.setState({ collationGroups: newCollationGroups });
  }

  /**
   * Toggle the conjoin option for a specific group
   * @param {object} updatedGroup
   * @public
   */
  handleToggleConjoin = (updatedGroup) => {
    let newCollationGroups = [];
    this.state.collationGroups.forEach((group, i) => {
      if (updatedGroup.number === i+1) {
        updatedGroup = {...group};
        updatedGroup.conjoin = !updatedGroup.conjoin;
        newCollationGroups.push(updatedGroup);
      } else {
        newCollationGroups.push(group);
      }
    });
    this.setState({ collationGroups: newCollationGroups });
  }


  finish = () => {
    const user = {
      id: this.props.user.id,
      token: this.props.user.token
    };
    let request = {
      project: {
        title: this.state.title,
        shelfmark: this.state.shelfmark,
        metadata: {
          date: this.state.date
        }
      },
      groups: []
    }
    this.state.collationGroups.forEach((group)=>request.groups.push(group));
    this.props.createProject(request, user);
    this.reset(); 
    this.props.close();
  }

  handleRequestClose = () => {  
    if (this.state.step===1) {
      this.reset();
      this.props.close();
    }
  }


  render() {
    let content = <NewProjectSelection 
      setProjectType={(type)=>this.set("projectType",type)}
    />;
    if (this.state.projectType==="new") {
      if (this.state.step===1) {
        content = <ProjectDetails 
          title={this.state.title}
          shelfmark={this.state.shelfmark}
          date={this.state.date}
          errors={this.state.errors}
          step={this.state.step}
          set={this.set}
          nextStep={()=>this.set("step", 2)}
          previousStep={this.reset}
          doErrorsExist={this.doErrorsExist}
        />;
      } else {
        content = <ProjectStructure 
          finish={this.finish}
          previousStep={()=>this.set("step", 1)}
          set={this.set}
          quireNo={this.state.quireNo}
          leafNo={this.state.leafNo}
          conjoined={this.state.conjoined}
          collationGroups={this.state.collationGroups}
          handleToggleConjoin={this.handleToggleConjoin}
          onInputChangeCollationGroupsRows={this.onInputChangeCollationGroupsRows}
          addCollationRows={this.handleAddNewCollationGroupRow}
          handleRemoveCollationGroupRow={this.handleRemoveCollationGroupRow}
        />;
      }
    } else if (this.state.projectType==="import") {
        content = (
          <ImportProject 
            previousStep={this.reset}
            importProject={this.props.importProject}
            importStatus={this.props.importStatus}
            reset={this.reset}
            close={this.props.close}
          />
        );
    }
    else if (this.state.projectType==="clone") {
      content = (
        <CloneProject 
          previousStep={this.reset}
          cloneProject={this.props.cloneProject}
          allProjects={this.props.allProjects}
          reset={this.reset}
          close={this.props.close}
        />
      );
    }
    return (
      <div>
        <Dialog
          modal={false}
          open={this.props.open}
          onRequestClose={()=>this.handleRequestClose()}
          className="newProjectDialog"
          autoScrollBodyContent
        >
          {content}
        </Dialog>
      </div>
    );
  }
}
