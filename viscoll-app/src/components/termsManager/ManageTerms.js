import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import EditTermForm from './EditTermForm';
import NewTermForm from './NewTermForm';
import Add from 'material-ui/svg-icons/content/add';
import { btnMd, btnBase } from '../../styles/button';

/** Create New Term tab in the Term Manager */
export default class ManageTerms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTerm: null,
      title: '',
      type: '',
      description: '',
    };
  }

  /**
   * Update state when user clicks on new term item
   */
  onItemChange = activeTerm => {
    this.setState({ activeTerm });
  };

  componentWillReceiveProps(nextProps) {
    if (this.state.activeTerm)
      this.setState({ activeTerm: nextProps.Terms[this.state.activeTerm.id] });
  }

  /**
   * Mapping function to render a term thumbnail
   */
  renderList = termID => {
    const term = this.props.Terms[termID];
    return (
      <button
        type="button"
        name="termButton"
        aria-label={'Term: ' + term.title}
        className={
          this.state.activeTerm && this.state.activeTerm.id === termID
            ? 'termButton item active'
            : 'termButton item'
        }
        onClick={() => this.onItemChange(term)}
        tabIndex={this.props.tabIndex}
        key={termID}
      >
        <div>
          <div className="title">
            {term.title.length > 80
              ? term.title.substring(0, 80) + '...'
              : term.title}
          </div>
          <div className="type">{term.type}</div>
        </div>
      </button>
    );
  };

  /**
   * Clear values in the input fields
   */
  reset = () => {
    this.setState({
      title: '',
      type: '',
      description: '',
    });
  };

  deleteTerm = termID => {
    this.props.action.deleteTerm(termID);
    this.setState({ activeTerm: null });
  };

  updateTerm = (termID, term) => {
    this.props.action.updateTerm(termID, term);
  };

  linkTerm = (termID, object) => {
    this.props.action.linkTerm(termID, object);
  };

  unlinkTerm = (termID, object) => {
    this.props.action.unlinkTerm(termID, object);
  };

  linkAndUnlinkTerms = (termID, linkObjects, unlinkObjects) => {
    this.props.action.linkAndUnlinkTerms(termID, linkObjects, unlinkObjects);
  };

  getLinkedGroups = () => {
    const groupsWithCurrentTerm = Object.keys(this.props.Groups).filter(
      groupID => {
        return this.props.Groups[groupID].terms.includes(
          this.state.activeTerm.id
        );
      }
    );
    return groupsWithCurrentTerm.map(value => {
      const label = `Group ${this.props.groupIDs.indexOf(value) + 1}`;
      return { label, value };
    });
  };

  getLinkedLeaves = () => {
    const leafsWithCurrentTerm = Object.keys(this.props.Leafs).filter(
      leafID => {
        return this.props.Leafs[leafID].terms.includes(
          this.state.activeTerm.id
        );
      }
    );
    return leafsWithCurrentTerm.map(value => {
      const label = `Leaf ${this.props.leafIDs.indexOf(value) + 1}`;
      return { label, value };
    });
  };

  getLinkedSides = () => {
    const rectosWithCurrentTerm = Object.keys(this.props.Rectos).filter(
      rectoID => {
        return this.props.Rectos[rectoID].terms.includes(
          this.state.activeTerm.id
        );
      }
    );
    const versosWithCurrentTerm = Object.keys(this.props.Versos).filter(
      versoID => {
        return this.props.Versos[versoID].terms.includes(
          this.state.activeTerm.id
        );
      }
    );
    const sidesWithCurrentTerm = [];
    for (let value of rectosWithCurrentTerm) {
      const leafOrder =
        this.props.leafIDs.indexOf(this.props.Rectos[value].parentID) + 1;
      const folioNumber =
        this.props.Rectos[value].folio_number &&
        this.props.Rectos[value].folio_number !== ''
          ? `(${this.props.Rectos[value].folio_number})`
          : '';
      const pageNumber =
        this.props.Rectos[value].page_number &&
        this.props.Rectos[value].page_number !== ''
          ? `(${this.props.Rectos[value].page_number})`
          : '';
      const label = `L${leafOrder} Recto ${folioNumber} ${pageNumber}`;
      sidesWithCurrentTerm.push({ label, value });
    }
    for (let value of versosWithCurrentTerm) {
      const leafOrder =
        this.props.leafIDs.indexOf(this.props.Versos[value].parentID) + 1;
      const folioNumber =
        this.props.Versos[value].folio_number &&
        this.props.Versos[value].folio_number !== ''
          ? `(${this.props.Versos[value].folio_number})`
          : '';
      const pageNumber =
        this.props.Versos[value].page_number &&
        this.props.Versos[value].page_number !== ''
          ? `(${this.props.Versos[value].page_number})`
          : '';
      const label = `L${leafOrder} Verso ${folioNumber} ${pageNumber}`;
      sidesWithCurrentTerm.push({ label, value });
    }
    return sidesWithCurrentTerm;
  };

  getRectosAndVersos = () => {
    const size = Object.keys(this.props.Rectos).length;
    let result = {};
    for (let i = 0; i < size; i++) {
      const rectoID = Object.keys(this.props.Rectos)[i];
      const versoID = Object.keys(this.props.Versos)[i];
      result[rectoID] = this.props.Rectos[rectoID];
      result[versoID] = this.props.Versos[versoID];
    }
    return result;
  };

  render() {
    let termForm;
    if (!this.state.activeTerm) {
      termForm = (
        <NewTermForm
          Terms={this.props.Terms}
          projectID={this.props.projectID}
          action={{ addTerm: this.props.action.addTerm }}
          noteTypes={this.props.noteTypes}
          groupIDs={this.props.groupIDs}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs}
          versoIDs={this.props.versoIDs}
        />
      );
    } else {
      termForm = (
        <EditTermForm
          action={{
            addTerm: this.props.action.addTerm,
            updateTerm: this.updateTerm,
            deleteTerm: this.deleteTerm,
            linkTerm: this.linkTerm,
            unlinkTerm: this.unlinkTerm,
            linkAndUnlinkTerms: this.linkAndUnlinkTerms,
          }}
          projectID={this.props.projectID}
          Terms={this.props.Terms}
          term={this.state.activeTerm}
          noteTypes={this.props.noteTypes}
          Groups={this.props.Groups}
          Leafs={this.props.Leafs}
          Rectos={this.props.Rectos}
          Versos={this.props.Versos}
          groupIDs={this.props.groupIDs}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs}
          versoIDs={this.props.versoIDs}
          Sides={this.getRectosAndVersos()}
          linkedGroups={this.getLinkedGroups()}
          linkedLeaves={this.getLinkedLeaves()}
          linkedSides={this.getLinkedSides()}
          togglePopUp={this.props.togglePopUp}
          tabIndex={this.props.tabIndex}
        />
      );
    }

    return (
      <div className="browse">
        <div className="termsList">
          <div role="region" aria-label="browse term titles">
            <RaisedButton
              primary={!this.state.activeTerm ? false : true}
              className={'item add item'}
              onClick={() => this.onItemChange(null)}
              style={{ width: '90%' }}
              {...btnMd}
              label="Create New Term"
              labelStyle={{ ...btnBase().labelStyle }}
              icon={<Add />}
              labelColor={'#ffffff'}
              backgroundColor={'#566476'}
              tabIndex={this.props.tabIndex}
            ></RaisedButton>
            {Object.keys(this.props.Terms).map(this.renderList)}
          </div>
        </div>
        <div className="details" role="region" aria-label="term details">
          {termForm}
        </div>
      </div>
    );
  }
}
