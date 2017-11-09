import React from 'react';
import PropTypes from 'prop-types';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import IconSubmit from 'material-ui/svg-icons/action/done';
import IconClear from 'material-ui/svg-icons/content/clear';

/**
 * Form to edit project information on the project panel in the dashboard
 */

class EditProjectForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      unsavedDialog: false,
      deleteDialog: false,
      editing: {
        title: false,
        shelfmark: false,
        date: false,
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
        selectedProjectIndex: nextProps.selectedProjectIndex,
      })
    }
  }

  /**
   * Validate user input and display appropriate error message
   * @param {string} type text field name
   * @public
   */
  checkValidationError = (type) => {
    const errors = {};
    const allProjectsExceptCurrent = [...this.state.allProjects];
    allProjectsExceptCurrent.splice(this.state.selectedProjectIndex, 1);
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
    event.preventDefault();
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
    const user = {
      id: this.props.user.id,
      token: this.props.user.token
    };
    this.props.deleteProject(projectID, user);
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
            primary
            icon={<IconSubmit />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            name="submit"
            type="submit"
            disabled={this.ifErrorsExist()}
          />
          <RaisedButton
            secondary
            icon={<IconClear />}
            style={{minWidth:"60px",marginLeft:"5px"}}
            onTouchTap={(e)=>this.handleProjectCancelUpdate(field)}
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
            onChange={(event, newValue) => this.onInputChange(event, newValue, "title")}
            floatingLabelStyle={{fontSize: 25}}
            fullWidth={true}
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
            floatingLabelStyle={{fontSize: 25}}
            fullWidth={true}
          />
          {this.submitButtons("shelfmark")}
        </form>
        <form onSubmit={(e)=>this.handleProjectUpdate(e, "date")}>
          <TextField
            floatingLabelText="Manuscript Date"
            floatingLabelFixed
            value={this.state.date}
            errorText={this.state.errors.date}
            onChange={(event, newValue) => this.onInputChange(event, newValue, "date")}
            floatingLabelStyle={{fontSize: 25}}
            fullWidth={true}
            hintText="N/A"
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
        onTouchTap={() => this.handleDeleteDialogToggle()}
      />,
      <FlatButton
        label="Yes"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleProjectDelete}
      />,
    ];

    const unsaveActions = [
      <FlatButton
        label="Go Back"
        primary={true}
        onTouchTap={() => this.handleUnsavedDialogToggle()}
      />,
      <FlatButton
        label="Ignore Changes"
        primary={true}
        keyboardFocused={true}
        onTouchTap={() => this.handleProjectPanelClose(true)}
      />,
    ];


    return (
      <div style={{padding: 5 }}>

        <IconButton style={{float: 'right'}}> 
          <CloseIcon onClick={() => this.handleProjectPanelClose()} />
        </IconButton>

          {projectPanelData}

        <br />

        <RaisedButton 
          label="Open Project" 
          onTouchTap={() => this.props.history.push(`/project/${this.props.selectedProject.id}`)} 
          secondary
          style={{width:"49%",float:"left",marginRight:"2%"}}
          />
        <RaisedButton 
          label="Delete Project" 
          onTouchTap={() => this.handleDeleteDialogToggle(true)} 
          labelColor="#D87979"
          style={{width:"49%"}}
          />

        <Dialog
          title="Are you sure you want to delete this project?"
          actions={deleteActions}
          modal={false}
          open={this.state.deleteDialog}
          onRequestClose={this.handleDeleteDialogToggle}
        />
  
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
  static propTypes = {
    /** Array of projects belonging to the user. */
    allProjects: PropTypes.array,
    /** Currently selected project object. */
    selectedProject: PropTypes.shape({
      created_at: PropTypes.string,
      updated_at: PropTypes.string,
      id: PropTypes.string, 
      title: PropTypes.string,
    }), 
    /** Index of the selected project in the list of projects belonging to the user. */
    selectedProjectIndex: PropTypes.number,
    /** Callback to close the project panel. */
    closeProjectPanel: PropTypes.func,
    /** Callback to update a project. */
    updateProject: PropTypes.func,
    /** Callback to delete a project. */
    deleteProject: PropTypes.func,
    /** User object */
    user: PropTypes.object,
    
  }
}



export default EditProjectForm;
