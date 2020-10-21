import React, { Component } from 'react';
import { connect } from 'react-redux';
import TopBar from './TopBar';
import ManageTerms from '../components/termsManager/ManageTerms';
import Taxonomy from '../components/termsManager/Taxonomy';
import { Tabs, Tab } from 'material-ui/Tabs';
// import Panel from '../components/global/Panel';
import topbarStyle from '../styles/topbar';
import {
  changeManagerMode,
  changeTermsTab,
} from '../actions/backend/interactionActions';
import {
  addTerm,
  updateTerm,
  deleteTerm,
  createTaxonomy,
  updateTaxonomy,
  deleteTaxonomy,
  linkTerm,
  unlinkTerm,
} from '../actions/backend/termActions';
import { sendFeedback } from '../actions/backend/userActions';
import ManagersPanel from '../components/global/ManagersPanel';

class TermsManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Terms: props.Terms,
      value: '',
      filterTypes: {
        title: true,
        taxonomy: true,
        description: true,
        // TODO: add URI?
      },
      windowWidth: window.innerWidth,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ Terms: nextProps.Terms }, () => this.applyFilter());
  }

  resizeHandler = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  applyFilter = () => {
    this.filterTerms(this.state.value, this.state.filterTypes);
  };

  onValueChange = (e, value) => {
    this.setState({ value }, () => this.applyFilter());
  };

  onTypeChange = (type, checked) => {
    this.setState(
      { filterTypes: { ...this.state.filterTypes, [type]: checked } },
      () => this.applyFilter()
    );
  };

  handleAddTerm = term => {
    const userID = this.props.user.id;
    const date = Date.now().toString();
    const IDHash = userID + date;
    term['id'] = IDHash.substr(IDHash.length - 24);
    this.props.addTerm(term);
  };

  filterTerms = (value, filterTypes) => {
    if (value === '') {
      this.setState({ Terms: this.props.Terms });
    } else {
      let filteredTerms = {};
      let isNoneSelected = true;
      for (let type of Object.keys(filterTypes)) {
        if (filterTypes[type]) {
          isNoneSelected = false;
          break;
        }
      }
      if (isNoneSelected)
        filterTypes = { title: true, taxonomy: true, description: true };
      for (let termID in this.props.Terms) {
        const term = this.props.Terms[termID];
        for (let type of Object.keys(filterTypes)) {
          if (
            filterTypes[type] &&
            term[type].toUpperCase().includes(value.toUpperCase())
          )
            if (filteredTerms[termID]) break;
            else filteredTerms[termID] = term;
        }
      }
      this.setState({ Terms: filteredTerms });
    }
  };

  toggleFilterDrawer = () => {
    this.setState({ filterOpen: !this.state.filterOpen });
  };

  updateTerm = (termID, term) => {
    this.props.updateTerm(termID, term, this.props);
  };

  linkTerm = (termID, object) => {
    this.props.linkTerm(termID, object, this.props);
  };

  unlinkTerm = (termID, object) => {
    this.props.unlinkTerm(termID, object, this.props);
  };

  linkAndUnlinkTerms = (termID, linkObjects, unlinkObjects) => {
    this.props.linkAndUnlinkTerms(
      termID,
      linkObjects,
      unlinkObjects,
      this.props
    );
  };

  render() {
    let content = '';

    if (this.props.activeTab === 'MANAGE') {
      content = (
        <ManageTerms
          action={{
            updateTerm: this.updateTerm,
            addTerm: this.handleAddTerm,
            deleteTerm: this.props.deleteTerm,
            linkTerm: this.linkTerm,
            unlinkTerm: this.unlinkTerm,
            linkAndUnlinkTerms: this.linkAndUnlinkTerms,
          }}
          projectID={this.props.projectID}
          notification={this.props.notification}
          Taxonomies={this.props.taxonomies}
          Terms={this.state.Terms}
          Groups={this.props.Groups}
          Leafs={this.props.Leafs}
          Rectos={this.props.Rectos}
          Versos={this.props.Versos}
          groupIDs={this.props.groupIDs}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs}
          versoIDs={this.props.versoIDs}
          togglePopUp={this.props.togglePopUp}
          tabIndex={this.props.popUpActive ? -1 : 0}
          windowWidth={this.state.windowWidth}
        />
      );
    } else if (this.props.activeTab === 'TYPES') {
      content = (
        <Taxonomy
          Terms={this.state.Terms}
          projectID={this.props.projectID}
          Taxonomies={this.props.Taxonomies}
          action={{
            createTaxonomy: this.props.createTaxonomy,
            updateTaxonomy: this.props.updateTaxonomy,
            deleteTaxonomy: taxonomies =>
              this.props.deleteTaxonomy(taxonomies, this.props),
          }}
          togglePopUp={this.props.togglePopUp}
          tabIndex={this.props.popUpActive ? -1 : 0}
        />
      );
    }

    let sidebarClasses = 'sidebar';
    if (this.props.popUpActive) sidebarClasses += ' lowerZIndex';

    const sidebar = (
      <div className={sidebarClasses} role="region" aria-label="sidebar">
        <hr />
        <ManagersPanel
          popUpActive={this.props.popUpActive}
          managerMode={this.props.managerMode}
          changeManagerMode={this.props.changeManagerMode}
        />
      </div>
    );

    return (
      <div className="termsManager">
        <TopBar
          termsFilter={this.props.activeTab === 'MANAGE'}
          filterTerms={this.filterTerms}
          onValueChange={this.onValueChange}
          onTypeChange={this.onTypeChange}
          filterTypes={this.state.filterTypes}
          history={this.props.history}
          tabIndex={this.props.popUpActive ? -1 : 0}
          popUpActive={this.props.popUpActive}
          windowWidth={this.state.windowWidth}
          showUndoRedo={true}
        >
          <Tabs
            tabItemContainerStyle={{ backgroundColor: '#ffffff' }}
            value={this.props.activeTab}
            onChange={v => this.props.changeTermsTab(v)}
          >
            <Tab
              label="Manage Terms"
              value="MANAGE"
              buttonStyle={topbarStyle().tab}
              tabIndex={this.props.popUpActive ? -1 : 0}
            />
            <Tab
              label="Edit Taxonomies"
              value="TYPES"
              buttonStyle={topbarStyle().tab}
              tabIndex={this.props.popUpActive ? -1 : 0}
            />
          </Tabs>
        </TopBar>
        {sidebar}
        <div className="termsWorkspace">{content}</div>
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    user: state.user,
    projectID: state.active.project.id,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
    Groups: state.active.project.Groups,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Terms: state.active.project.Terms,
    Taxonomies: state.active.project.Taxonomies,
    activeTab: state.active.termsManager.activeTab,
    termsManager: state.active.termsManager,
    managerMode: state.active.managerMode,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    changeManagerMode: managerMode => {
      dispatch(changeManagerMode(managerMode));
    },
    changeTermsTab: tabName => {
      dispatch(changeTermsTab(tabName));
    },
    addTerm: term => {
      dispatch(addTerm(term));
    },
    updateTerm: (termID, term, props) => {
      dispatch(updateTerm(termID, term));
    },
    deleteTerm: termID => {
      dispatch(deleteTerm(termID));
    },
    createTaxonomy: taxonomy => {
      dispatch(createTaxonomy(taxonomy));
    },
    updateTaxonomy: taxonomy => {
      dispatch(updateTaxonomy(taxonomy));
    },
    deleteTaxonomy: (taxonomy, props) => {
      dispatch(deleteTaxonomy(taxonomy));
    },
    linkTerm: (termID, object, props) => {
      dispatch(linkTerm(termID, object));
    },
    unlinkTerm: (termID, object, props) => {
      dispatch(unlinkTerm(termID, object));
    },
    linkAndUnlinkTerms: (termID, linkObjects, unlinkObjects, props) => {
      if (linkObjects.length > 0) {
        dispatch(linkTerm(termID, linkObjects));
      }
      if (unlinkObjects.length > 0) {
        dispatch(unlinkTerm(termID, unlinkObjects));
      }
    },
    sendFeedback: (title, message, userID) => {
      dispatch(sendFeedback(title, message, userID));
    },
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(TermsManager);
