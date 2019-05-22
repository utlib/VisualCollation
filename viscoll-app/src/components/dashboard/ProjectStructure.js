import React from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import IconClear from 'material-ui/svg-icons/content/clear';
import IconHelp from 'material-ui/svg-icons/action/help';
import IconButton from 'material-ui/IconButton';
import SelectField from '../global/SelectField';

/** New Project dialog - panel to create initial collation structure */
const ProjectStructure = (props) => {

  /**
   * Return a list of MenuItem's for the unconjoined drop down menu 
   */
  let menuItems = (selectedValue, unconjoinLeafsList, isDisabled) => {
    if (isDisabled) {
      return ([{
        key: selectedValue+"blank",
        value: 0,
        text: "",
      }])
    }
    return unconjoinLeafsList.map((val) => { 
        return {
          key:val,
          value:val+1,
          text:"Leaf "+(val+1),
        }
      }
    );
  }

  const collationGroupsRows = [];
  props.collationGroups.forEach((group) => {
    const unconjoinLeafsList = !group.leaves? [] : Array.from(Array(group.leaves).keys());
    collationGroupsRows.push(
      <TableRow key={group.number}>
        <TableRowColumn aria-label="Group number" style={{paddingTop:"1em",textAlign: "center"}}>{group.number}</TableRowColumn>
        <TableRowColumn aria-label="Number of leaves" style={{textAlign: "center"}}>
          <TextField
            aria-label={"Number of leaves in group " + group.number}
            id={group.number+"_number_of_leaves"}
            type="number"
            value={group.leaves}
            required
            min={1}
            onChange={(e)=>props.onInputChangeCollationGroupsRows(e, group, "leaves")}
            style={{width:50}}
          />
        </TableRowColumn>
        <TableRowColumn aria-label="Conjoined?" style={{paddingTop:"0.75em"}}>
          <Checkbox 
            aria-label="Conjoin leaves in quire"
            onClick={() => props.handleToggleConjoin(group)}
            checked={group.conjoin}
            disabled={group.leaves<=1}
            style={{marginLeft:8}}
          /> 
        </TableRowColumn>
        <TableRowColumn aria-label="Leaf to leave out if quire is conjoined" style={{paddingTop:"1em", paddingLeft:0, paddingRight:0}}>
          <SelectField
            id={"unconjoinField"+group.number}
            label={"Leaf number to unconjoin in group " + group.number }
            onChange={(value)=>{props.onInputChangeCollationGroupsRows(null, group, "oddLeaf", value)}}
            data={menuItems(group.oddLeaf, unconjoinLeafsList, (!group.conjoin || group.leaves%2 === 0))}
            value={group.oddLeaf}
            disabled={(!group.conjoin || group.leaves%2 === 0)}
            maxHeight={200}
          >
          </SelectField>
        </TableRowColumn>
        <TableRowColumn aria-label="Remove row" style={{textAlign: "center"}}>
          <IconButton 
              aria-label="Remove"
              onClick={() => props.handleRemoveCollationGroupRow(group.number)}
            >
              <IconClear/>
          </IconButton>
        </TableRowColumn>
      </TableRow>
    );
  });

    return (
      <div style={{width:"100%", margin: "auto"}}>
        <div style={{position:"absolute", right:5, top:5}}>  
          <IconButton tooltip="More info coming soon">
            <IconHelp color={"#727272"} />
          </IconButton>
        </div>
        <h1 style={{textAlign:"center"}}>Structure</h1>
        <p style={{paddingTop: 20, textAlign:"center"}}>
          Pre-populate your collation with quires and leaves by using the formula below.  
          Generate the items by clicking the "Add" button.  You can add multiple times.
        </p>
        <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"space-evenly", alignItems: "center", padding:"1em 0em", background:"#f8f8f8", border:"solid 1px #e2e2e2"}}>
          <label id="numQuires" style={{color:"#4e4e4e"}}>
            # of Quires 
          </label>
          <div>
            <TextField
              aria-labelledby="numQuires"
              name="quireNo"
              value={props.quireNo}
              onChange={(event, newValue) => {props.set("quireNo", parseInt(newValue, 10))}}
              style={{width:50}}
              type="number"
            />
          </div>
          <label id="numLeaves" style={{color:"#4e4e4e"}}>
            &times;
            # of Leaves 
          </label>
          <div>
            <TextField
              aria-labelledby="numLeaves"
              name="leafNo"
              value={props.leafNo}
              onChange={(event, newValue) => {props.set("leafNo", parseInt(newValue, 10))}}
              style={{width:50}}
              type="number"
              min="1"
            />
          </div>
          <div>
            <Checkbox
              label="Conjoin"
              aria-label="Conjoin leaves in quire"
              checked={props.conjoined}
              onClick={()=>props.set("conjoined", !props.conjoined)}
            />
          </div>
          <div>
            <RaisedButton 
              label="Add"
              aria-label="Add"
              onClick={() => props.addCollationRows()}
              primary
            />
          </div>
        </div>
        {collationGroupsRows.length>0?
          <div aria-label="Collation structure" style={{paddingTop:20}}>
            <Table selectable={false} fixedHeader={false}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn style={{textAlign: "center", color:"#4e4e4e"}}>Quire no.</TableHeaderColumn>
                  <TableHeaderColumn style={{color:"#4e4e4e"}}>Number of leaves</TableHeaderColumn>
                  <TableHeaderColumn style={{color:"#4e4e4e"}}>Conjoin</TableHeaderColumn>
                  <TableHeaderColumn style={{color:"#4e4e4e"}}>Unconjoined leaf</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {collationGroupsRows}
              </TableBody>
            </Table>
          </div> : ""
        }
        
        <div style={{textAlign:"center",paddingTop:30}}>
          <FlatButton 
              label="Back"
              aria-label="Back"
              onClick={() => props.previousStep()}
          />
          {props.collationGroups.length>0?
          <RaisedButton 
            label="Next"
            aria-label="Next"
            primary
            onClick={() => props.nextStep()}
          />:""}
        </div>
      </div>
    );
}
export default ProjectStructure;
