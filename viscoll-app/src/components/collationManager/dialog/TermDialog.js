import React from 'react';
import EditTermForm from '../../termsManager/EditTermForm';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

/** Term dialog */
export default class TermDialog extends React.Component {
  getLinkedGroups = () => {
    const groupsWithCurrentTerm = Object.keys(this.props.Groups).filter((groupID) => {
      return (this.props.Groups[groupID].terms.includes(this.props.activeTerm.id))
    });
    return groupsWithCurrentTerm.map((value) => {
      const label = `Group ${this.props.groupIDs.indexOf(value)+1}`;
      return {label, value};
    });
  }

  getLinkedLeaves = () => {
    const leafsWithCurrentTerm = Object.keys(this.props.Leafs).filter((leafID) => {
      return (this.props.Leafs[leafID].terms.includes(this.props.activeTerm.id))
    });
    return leafsWithCurrentTerm.map((value)=>{
      const label = `Leaf ${this.props.leafIDs.indexOf(value)+1}`;
      return {label, value};
    });
  }

  getLinkedSides = () => {
    const rectosWithCurrentTerm = Object.keys(this.props.Rectos).filter((rectoID) => {
      return (this.props.Rectos[rectoID].terms.includes(this.props.activeTerm.id))
    });
    const versosWithCurrentTerm = Object.keys(this.props.Versos).filter((versoID) => {
      return (this.props.Versos[versoID].terms.includes(this.props.activeTerm.id))
    });
    const sidesWithCurrentTerm = [];
    for (let value of rectosWithCurrentTerm){
      const leafOrder = this.props.leafIDs.indexOf(this.props.Rectos[value].parentID) + 1;
      const folioNumber = this.props.Rectos[value].folio_number && this.props.Rectos[value].folio_number!==""? `(${this.props.Rectos[value].folio_number})`:"";
      const pageNumber = this.props.Rectos[value].page_number && this.props.Rectos[value].page_number!==""? `(${this.props.Rectos[value].page_number})`:"";
      const label = `L${leafOrder} Recto ${folioNumber} ${pageNumber}`;
      sidesWithCurrentTerm.push({label, value})
    }
    for (let value of versosWithCurrentTerm){
      const leafOrder = this.props.leafIDs.indexOf(this.props.Versos[value].parentID) + 1;
      const folioNumber = this.props.Versos[value].folio_number && this.props.Versos[value].folio_number!==""? `(${this.props.Versos[value].folio_number})`:"";
      const pageNumber = this.props.Versos[value].page_number && this.props.Versos[value].page_number!==""? `(${this.props.Versos[value].page_number})`:"";
      const label = `L${leafOrder} Verso ${folioNumber} ${pageNumber}`;
      sidesWithCurrentTerm.push({label, value})
    }
    return sidesWithCurrentTerm;
  }

  getRectosAndVersos = () => {
    const size = Object.keys(this.props.Rectos).length;
    let result = {};
    for (let i=0; i<size; i++){
      const rectoID = Object.keys(this.props.Rectos)[i];
      const versoID = Object.keys(this.props.Versos)[i];
      result[rectoID] = this.props.Rectos[rectoID]
      result[versoID] = this.props.Versos[versoID]
    }
    return result;
  }


  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onClick={this.props.closeTermDialog}
      />,
    ];
    return (
      <Dialog 
        actions={actions}
        modal={false}
        open={this.props.open}
        onRequestClose={this.props.closeTermDialog}
        autoScrollBodyContent
        contentStyle={{width:500}}
      >
      {this.props.open? 
        <EditTermForm
          action={{ 
            addTerm: this.props.action.addTerm,
            updateTerm: this.props.action.updateTerm,
            deleteTerm: this.props.action.deleteTerm,
            linkTerm: this.props.action.linkTerm,
            unlinkTerm: this.props.action.unlinkTerm,
            linkAndUnlinkTerms: this.props.action.linkAndUnlinkTerms,
          }} 
          projectID={this.props.projectID}
          Terms={this.props.Terms}
          term = {this.props.activeTerm}
          createErrors={this.props.createErrors} 
          updateErrors={this.props.updateErrors} 
          Taxonomies={this.props.Taxonomies}
          Groups={this.props.Groups}
          Leafs={this.props.Leafs}
          Rectos={this.props.Rectos}
          Versos={this.props.Versos}
          Sides={this.getRectosAndVersos()}
          linkedGroups={this.getLinkedGroups()}
          linkedLeaves={this.getLinkedLeaves()}
          linkedSides={this.getLinkedSides()}
          isReadOnly={this.props.isReadOnly}
          groupIDs={this.props.groupIDs}
          leafIDs={this.props.leafIDs}
          rectoIDs={this.props.rectoIDs}
          versoIDs={this.props.versoIDs}
          togglePopUp={this.props.togglePopUp}
        />: ""}
      </Dialog>
    );
  }

}




