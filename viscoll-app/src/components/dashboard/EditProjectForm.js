import React from 'react';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';
import Checkbox from 'material-ui/Checkbox';

/**
 * Form to edit project information on the project panel in the dashboard
 */

class EditProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unsavedDialog: false,
      deleteDialog: false,
      deleteUnlinkedImages: false,
      editing: {
        title: false,
        shelfmark: false,
        date: false,
      },
      errors: {
        title: "",
        shelfmark: "",
        date: "",
      },
    };
  }

  /**
   * Update project pane if a new project was selected in the dashboard
   * @param {object} nextProps
   * @public
   */
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedProject) {
      let title = nextProps.selectedProject.title;
      let shelfmark = nextProps.selectedProject.shelfmark;
      let date = nextProps.selectedProject.metadata.date;
      if (this.props.selectedProject && this.props.selectedProject.id === nextProps.selectedProject.id) {
        // Do not update the fields if they are currently editing and did not submit
        if (this.state.title !== title && this.state.editing.title) title = this.state.title;
        if (this.state.shelfmark !== shelfmark && this.state.editing.shelfmark) shelfmark = this.state.shelfmark;
        if (this.state.date !== date && this.state.editing.date) date = this.state.date;
      } else {
        // Switched project selection - reset editing states
        this.setState({
          editing: {
            title: false,
            shelfmark: false,
            date: false,
          },
        });
      }
      this.setState({
        title: title,
        shelfmark: shelfmark,
        date: date,
        errors: {
          title: "",
          shelfmark: "",
          date: "",
        },
        selectedProject: nextProps.selectedProject,
        allProjects: nextProps.allProjects,
      })
    }
  }

  /**
   * Validate user input and display appropriate error message
   * @param {string} type text field name
   * @public
   */
  checkValidationError = (type) => {
    const errors = {title:"", shelfmark:"", date:""};
    const allProjectsExceptCurrent = [...this.state.allProjects];
    const selectedProjectIndex = this.state.allProjects.findIndex((project)=>project.id===this.props.selectedProject.id);
    allProjectsExceptCurrent.splice(selectedProjectIndex, 1);
    allProjectsExceptCurrent.forEach(project => {
      if (type==="title"){
        if (project.title === this.state.title)
          errors.title = "Project title should be unique";
        if (!this.state.title)
          errors.title = "Project title is required";
      } else {
        if (project.shelfmark === this.state.shelfmark)
          errors.shelfmark = "Manuscript shelfmark should be unique";
        if (!this.state.shelfmark)
          errors.shelfmark = "Manuscript shelfmark is required";
      }
    });
    return errors;
  }

  /**
   * Return true if any errors exist in the project form
   * @public
   */
  ifErrorsExist = () => {
    if (this.state.errors.title)
      return true;
    if (this.state.errors.shelfmark)
      return true;
    return false;
  }

  /**
   * Update state when user inputs new value in a text field 
   * @param {string} event 
   * @param {string} newValue new value 
   * @param {string} type text field name
   * @public
   */
  onInputChange = (event, newValue, type) => {
    this.setState({[type]: newValue, editing: {...this.state.editing, [type]:true}}, () => {
      this.setState({errors: this.checkValidationError(type)}) 
    });
  }

  /**
   * Toggle delete confirmation dialog
   * @param {boolean} deleteDialog show dialog?
   * @public
   */
  handleDeleteDialogToggle = (deleteDialog=false) => {
    this.props.togglePopUp(deleteDialog);
    this.setState({ deleteDialog });
  };

  /**
   * Toggle unsaved changes dialog
   * @param {boolean} unsavedDialog show dialog?
   * @public
   */
  handleUnsavedDialogToggle = (unsavedDialog=false) => {
    this.setState({ unsavedDialog });
  };

  /**
   * Submit project update of a specific input field 
   * @param {object} event
   * @param {string} field text field name
   * @public
   */
  handleProjectUpdate = (event, field) => {
    if (event) event.preventDefault();
    const projectID = this.props.selectedProject.id;
    const project = {
      title: this.state.title,
      shelfmark: this.state.shelfmark, 
      metadata: {
        date: this.state.date
      }
    };
    const user = {
      id: this.props.user.id,
      token: this.props.user.token
    };
    this.setState({editing: {...this.state.editing, [field]: false }});
    this.props.updateProject(projectID, project, user);
  }
  /**
   * Submit project delete 
   * @public
   */
  handleProjectDelete = () => {
    this.props.closeProjectPanel();
    this.setState({deleteDialog: false});
    const projectID = this.props.selectedProject.id;
    this.props.deleteProject(projectID, this.state.deleteUnlinkedImages);
  };

  /**
   * Close project panel
   * @param {boolean} ignoreChanges show ignore changes dialog?
   * @public
   */
  handleProjectPanelClose = (ignoreChanges=false) => {
    // Check for any unsaved changes before closing and show the warning dialog.
    if (!ignoreChanges && this.isEditing()) 
      this.setState({ unsavedDialog: true });
    else {
      this.setState({ unsavedDialog: false });
      this.props.closeProjectPanel();
    }
  }

  /**
   * Return true if any input fields have been changed and not saved
   * @public
   */
  isEditing = () => {
    return (this.state.editing.title||this.state.editing.shelfmark||this.state.editing.uri||this.state.editing.date);
  }

  /**
   * Reset text field to original values
   * @param {string} type "project"
   * @param {string} field text field name
   * @public
   */
  handleProjectCancelUpdate = (field) => {
    this.setState({
      [field]: this.props.selectedProject[field], 
      editing: {...this.state.editing, [field]: false },
      errors: {...this.state.errors, [field]: ""},
    });
  }

  /**
   * Return a generated HTML of submit and cancel buttons for a specific input name
   * @param {string} field text field name
   * @public
   */
  submitButtons = (field) => {
    if (this.state.editing[field]) {
      return (
        <div style={{float:"right"}}>
          <RaisedButton
            aria-label="Submit"
            primary
            icon={<IconSubmit />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            name="submit"
            type="submit"
            disabled={this.ifErrorsExist()}
            onClick={() => this.handleProjectUpdate(null, field)}
          />
          <RaisedButton
            aria-label="Cancel"
            secondary
            icon={<IconClear />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            onClick={() => this.handleProjectCancelUpdate(field)}
          />
        </div>
      )
    } else {
      return "";
    }
  }

  render() {
    const selectedProject = this.props.selectedProject;
    if (!selectedProject)
      return <div></div>;

    let projectPanelData = (
      <div className="projectPanelInfo">
        <form onSubmit={(e)=>this.handleProjectUpdate(e, "title")}>
          <TextField
            floatingLabelText="Project Title"
            floatingLabelFixed
            value={this.state.title}
            errorText={this.state.errors.title}
            aria-invalid={this.state.errors.title.length>0}
            onChange={(event, newValue) => this.onInputChange(event, newValue, "title")}
            floatingLabelStyle={{fontSize: 25, color: "#526C91"}}
            fullWidth={true}
            tabIndex={this.props.tabIndex}
            autoFocus={true}
          />
          {this.submitButtons("title")}
        </form>
        <form onSubmit={(e)=>this.handleProjectUpdate(e, "shelfmark")}>
          <TextField
            floatingLabelText="Manuscript Shelfmark"
            floatingLabelFixed
            value={this.state.shelfmark}
            errorText={this.state.errors.shelfmark}
            onChange={(event, newValue) => this.onInputChange(event, newValue, "shelfmark")}
            floatingLabelStyle={{fontSize: 25, color: "#526C91"}}
            fullWidth={true}
            tabIndex={this.props.tabIndex}
          />
          {this.submitButtons("shelfmark")}
        </form>
        <form onSubmit={(e)=>this.handleProjectUpdate(e, "date")}>
          <TextField
            floatingLabelText="Manuscript Date"
            floatingLabelFixed
            value={this.state.date}
            errorText={this.state.errors.date}
            aria-invalid={this.state.errors.date.length>0}
            onChange={(event, newValue) => this.onInputChange(event, newValue, "date")}
            floatingLabelStyle={{fontSize: 25, color: "#526C91"}}
            fullWidth={true}
            hintText="N/A"
            tabIndex={this.props.tabIndex}
          /> 
          {this.submitButtons("date")}
        </form>
        <div className="info">
          <span>Created at:</span> {new Date(selectedProject.created_at).toLocaleString('en-US')}<br />
          <span>Last modified:</span> {new Date(selectedProject.updated_at).toLocaleString('en-US')}<br />
        </div>

      </div>
    );

    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={() => this.handleDeleteDialogToggle()}
      />,
      <FlatButton
        label="Yes"
        primary={true}
        keyboardFocused={true}
        onClick={() => this.handleProjectDelete()}
      />,
    ];

    const unsaveActions = [
      <FlatButton
        label="Go Back"
        primary={true}
        onClick={() => this.handleUnsavedDialogToggle()}
      />,
      <FlatButton
        label="Ignore Changes"
        primary={true}
        keyboardFocused={true}
        onClick={() => this.handleProjectPanelClose(true)}
      />,
    ];

    
    return (
      <div style={{padding: 5 }} role="region" aria-label="Info panel of selected project" >

        <IconButton 
          aria-label="Close panel"
          style={{float: 'right'}}
          onClick={() => this.handleProjectPanelClose()}
          tabIndex={this.props.tabIndex}
        > 
          <CloseIcon 
          />
        </IconButton>

          {projectPanelData}

        <br />

        <RaisedButton 
          primary
          label="Open Project" 
          onClick={() => this.props.history.push(`/project/${this.props.selectedProject.id}`)}
          style={{width:"49%",float:"left",marginRight:"2%"}}
          tabIndex={this.props.tabIndex}
          />
        <RaisedButton 
          label="Delete Project" 
          onClick={() => this.handleDeleteDialogToggle(true)}
          labelColor="#b53c3c"
          style={{width:"49%"}}
          tabIndex={this.props.tabIndex}
          />

        <Dialog
          title="Are you sure you want to delete this project?"
          actions={deleteActions}
          modal={false}
          open={this.state.deleteDialog}
          onRequestClose={this.handleDeleteDialogToggle}
        >
        <Checkbox
          label="Delete images in this project that are not used elsewhere"
          checked={this.state.deleteUnlinkedImages}
          onCheck={()=>this.setState({deleteUnlinkedImages: !this.state.deleteUnlinkedImages})}
        />
        </Dialog>
  
        <Dialog
          title="It looks like you have been editing something. If you leave before saving, your changes will be lost."
          actions={unsaveActions}
          modal={false}
          open={this.state.unsavedDialog}
          onRequestClose={this.handleUnsavedDialogToggle}
        />  

      </div>
    );
  }
}



export default EditProjectForm;
