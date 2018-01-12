import React, { Component } from 'react';
import { connect } from "react-redux";
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import ClientJS from 'clientjs';
import { exportProjectBeforeFeedback } from "../actions/dashboardActions";
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
    this.setState({ open: true });
  }
  handleClose = () => {
    this.setState({
      open: false,
      title: "",
      feedback: "",
    });
    this.props.togglePopUp(false);
  }
  onChange = (type, value) => {
    this.setState({ [type]: value });
  }
  submit = () => {
    let feedback = this.state.feedback;
    let browserInformation;
    try {
      const client = new ClientJS();
      const result = client.getResult();
      browserInformation = JSON.stringify(result);
    } catch (e) { }
    this.props.sendFeedback(this.state.title, feedback, browserInformation, this.props.projectID);
    this.handleClose();
  }
  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={() => this.handleClose()}
      />,
      <RaisedButton
        label="Submit"
        primary={true}
        disabled={this.state.title.length === 0 || this.state.feedback.length === 0}
        onClick={() => this.submit()}
      />,
    ];
    return (
      <div>
        <div className="feedback">
          <FlatButton
            label="Feedback"
            labelStyle={{ color: "#ffffff" }}
            onClick={() => { this.handleOpen(); this.props.togglePopUp(true) }}
            backgroundColor="rgba(82, 108, 145, 0.2)"
            tabIndex={this.props.tabIndex}
          />
        </div>
        <Dialog
          title="Share your feedback"
          actions={actions}
          modal={true}
          open={this.state.open}
          paperClassName="feedbackDialog"
          contentStyle={{ width: "450px" }}
        >
          <p>Bug? Suggestions? Let us know!</p>
          <div>
            <div id="feedbackTitle" className="label">
              Title
            </div>
            <div className="input">
              <TextField
                name="title"
                aria-labelledby="feedbackTitle"
                value={this.state.title}
                onChange={(e, v) => this.onChange("title", v)}
                autoFocus
              />
            </div>
          </div>
          <div>
            <div id="feedbackContent" className="label">
              Feedback
            </div>
            <div className="input">
              <textarea
                name="feedback"
                aria-labelledby="feedbackContent"
                value={this.state.feedback}
                onChange={(e) => this.onChange("feedback", e.target.value)}
                rows={5}
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
    projectID: state.active.project ? state.active.project.id : null
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    sendFeedback: (title, message, browserInformation, projectID) => {
      if (projectID) {
        dispatch(exportProjectBeforeFeedback(projectID, "json"))
          .then((action) => {
            if (action.type === "EXPORT_SUCCESS") {
              const project = JSON.stringify(action.payload);
              dispatch(sendFeedback(title, message, browserInformation, project));
            }
          })
      } else {
        dispatch(sendFeedback(title, message, browserInformation));
      }
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
