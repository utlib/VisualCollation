import React, {Component} from 'react';
import { connect } from "react-redux";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import ClientJS from 'clientjs';
import { exportProjectBeforeFeedback } from "../actions/projectActions";
import { sendFeedback } from "../actions/userActions";

/** Feedback form that submits a JIRA ticket for each feedback */
class Feedback extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      title: "",
      feedback: "",
    }
  }
  handleOpen = () => {
    this.setState({open: true});
  }
  handleClose = () => {
    this.setState({
      open: false,
      title: "",
      feedback: "",
    });
  }
  onChange = (type, value) => {
    this.setState({[type]:value});
  }
  submit = () => {
    let feedback = "Feedback Message:\n" + this.state.feedback + "\n\n";
    try{
      const client = new ClientJS();
      const result = client.getResult();
      feedback = feedback + "Browser Information:\n" + JSON.stringify(result);
    } catch (e){}
    this.props.sendFeedback(this.state.title, feedback, this.props.userID, this.props.projectID);
    this.handleClose();
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={this.state.title.length===0 || this.state.feedback.length===0}
        onClick={this.submit}
      />,
    ];
    return (
      <div>
        <div className="feedback">
          <FlatButton 
            label="Feedback" 
            labelStyle={{color:"#ffffff"}}
            onClick={this.handleOpen}
            backgroundColor="rgba(82, 108, 145, 0.2)"
          />
        </div>
        <Dialog
          title="Share your feedback"
          actions={actions}
          modal={true}
          open={this.state.open}
          paperClassName="feedbackDialog"
          contentStyle={{width:"450px"}}
        >
          <p>Bug? Suggestions? Let us know!</p>
          <div>
            <div className="label">
              <h4>Title</h4>
            </div>
            <div className="input">
              <TextField
                name="title"
                value={this.state.title}
                onChange={(e,v)=>this.onChange("title", v)}
              />
            </div>
          </div>
          <div>
            <div className="label">
              <h4>Feedback</h4>
            </div>
            <div className="input">
              <TextField
                name="feedback"
                multiLine
                rows={2}
                rowsMax={5}
                value={this.state.feedback}
                onChange={(e,v)=>this.onChange("feedback", v)}
              />
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    userID: state.user.id,
    projectID: state.active.project.id
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sendFeedback: (title, message, userID, projectID) => {
      if (projectID){
        dispatch(exportProjectBeforeFeedback(projectID, "json"))
        .then((action)=>{
          if (action.type==="EXPORT_SUCCESS"){
            message = message + "\n\nProject Information:\n" + JSON.stringify(action.payload);
            dispatch(sendFeedback(title, message, userID));
          }
        })
      } else {
        dispatch(sendFeedback(title, message, userID));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
