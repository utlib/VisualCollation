import React, { Component } from 'react';
import { connect } from "react-redux";

import InfoBox from './InfoBox';
import ViewingMode from '../components/collationManager/ViewingMode';
import TermDialog from '../components/collationManager/dialog/TermDialog';
import {
  changeViewMode,
  handleObjectClick,
} from "../actions/backend/interactionActions";


class CollationManagerViewOnly extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      contentStyle: {
        transition: 'top 450ms cubic-bezier(0.23, 1, 0.32, 1)',
        top: 40,
      },
      leftSideBarOpen: false,
      activeTerm: null
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
    this.props.changeViewMode('VIEWING')
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  resizeHandler = () => {
    this.setState({ windowWidth: window.innerWidth });
  }

  handleObjectClick = (object, event) => {
    event.stopPropagation();
    this.props.handleObjectClick(
      this.props.selectedObjects,
      object,
      event,
      this.props.project.groupIDs,
      this.props.project.leafIDs,
      this.props.project.rectoIDs,
      this.props.project.versoIDs,
    );
  }

  closeTermDialog = () => {
    this.setState({ activeTerm: null, clickedFromDiagram: false }, () => this.props.togglePopUp(false));
  }

  openTermDialog = (term, clickedFromDiagram = false) => {
    this.setState({ activeTerm: term, clickedFromDiagram }, () => this.props.togglePopUp(true));
  }

  getCommonTerms = (props = this.props) => {
    // Find the common terms of all currently selected objects
    const memberType = props.selectedObjects.type;
    const members = props.selectedObjects.members;
    let terms = [];
    if (members.length > 0) {
      terms = props.project[memberType + "s"][members[0]].terms;
      for (let id of members) {
        terms = this.intersect(terms, props.project[memberType + "s"][id].terms);
      }
    }
    return terms;
  }

  /**
   * Returns items in common
   */
  intersect = (list1, list2) => {
    if (list1.length >= list2.length)
      return list1.filter((id1) => { return list2.includes(id1) });
    else
      return list2.filter((id1) => { return list1.includes(id1) });
  }


  render() {
    const containerStyle = { top: 85, right: "2%", height: 'inherit', maxHeight: '80%', width: '28%' };
    if (!this.state.leftSideBarOpen) {
      containerStyle["width"] = "30%";
    }

    const infobox = (
      <div
        className="infoBox"
        style={{ ...this.state.contentStyle, ...this.state.infoBoxStyle, right: "8%"}}
      >
        <InfoBox
          type={this.props.selectedObjects.type}
          user={this.props.user}
          closeTermDialog={this.closeTermDialog}
          commonTerms={this.getCommonTerms()}
          openTermDialog={this.openTermDialog}
          action={{
            linkTerm: () => { },
            unlinkTerm: () => { },
            updatePreferences: () => { }
          }}
          togglePopUp={this.props.togglePopUp}
          tabIndex={this.props.popUpActive ? -1 : 0}
          windowWidth={this.state.windowWidth}
        />
      </div>
    )

    let workspace = <div></div>;
    if (this.props.project.groupIDs.length > 0) {
      workspace = (
        <div role="main">
          <div className="projectWorkspace" style={{ ...this.state.contentStyle, left: "8%", width: "inherit" }}>
            <h1>{this.props.project.title}</h1>
            <ViewingMode
              project={this.props.project}
              collationManager={this.props.collationManager}
              handleObjectClick={this.handleObjectClick}
              selectedObjects={this.props.selectedObjects}
              imageViewerEnabled={false}
            />
          </div>
          {infobox}
        </div>
      );
    }
    if (this.props.project.groupIDs.length === 0 && !this.props.loading) {
      workspace = (
        <div role="main">
          <div className="projectWorkspace">
            <h3 style={{textAlign: 'center'}}>
              Project is either empty or does not exist
            </h3>
          </div>
        </div>
      );
    }

    return (
      <div className="collationManager">
        {workspace}
        <TermDialog
          open={this.state.activeTerm !== null}
          commonTerms={this.getCommonTerms()}
          activeTerm={this.state.activeTerm ? this.state.activeTerm : { id: null }}
          closeTermDialog={this.closeTermDialog}
          action={{
            updateTerm: () => { },
            deleteTerm: () => { },
            linkTerm: () => { },
            unlinkTerm: () => { },
            linkAndUnlinkTerms: () => { },
          }}
          projectID={this.props.project.id}
          Taxonomies={this.props.project.Taxonomies}
          Terms={this.props.project.Terms}
          Groups={this.props.project.Groups}
          groupIDs={this.props.project.groupIDs}
          Leafs={this.props.project.Leafs}
          leafIDs={this.props.project.leafIDs}
          Rectos={this.props.project.Rectos}
          rectoIDs={this.props.project.rectoIDs}
          Versos={this.props.project.Versos}
          versoIDs={this.props.project.versoIDs}
          togglePopUp={this.props.togglePopUp}
          isReadOnly={true}
        />
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    user: state.user,
    project: state.active.project,
    managerMode: state.active.managerMode,
    filterPanelOpen: state.active.collationManager.filters.filterPanelOpen,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    loading: state.global.loading,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeViewMode: (viewMode) => {
      dispatch(changeViewMode(viewMode));
    },
    handleObjectClick: (selectedObjects, object, event, Groups, Leafs, Rectos, Versos) => {
      dispatch(handleObjectClick(selectedObjects, object, event, { Groups, Leafs, Rectos, Versos }));
    },
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(CollationManagerViewOnly);
