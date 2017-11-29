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
import IconButton from 'material-ui/IconButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const ProjectStructure = (props) => {

  /**
   * Return a list of MenuItem's for the unconjoined drop down menu 
   * @param {number} selectedValue
   * @param {array} unconjoinLeafsList
   * @public
   */
  let menuItems = (selectedValue, unconjoinLeafsList, isDisabled) => {
    if (isDisabled) {
      return (<MenuItem
        key={selectedValue+"blank"}
        value={0}
        primaryText={""}
      />)
    }
    return unconjoinLeafsList.map((val) => (
      <MenuItem
        key={val}
        value={val+1}
        primaryText={"Leaf "+(val+1)}
      />
    ));
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
        <TableRowColumn aria-label="Conjoined?" style={{paddingTop:"0.75em", textAlign: "center"}}>
          <Checkbox 
            aria-label="Conjoin leaves in quire"
            onCheck={() => props.handleToggleConjoin(group)}
            checked={group.conjoin}
            disabled={group.leaves<=1}
            style={{marginLeft:8}}
          /> 
        </TableRowColumn>
        <TableRowColumn aria-label="Leaf to leave out if quire is conjoined" style={{paddingTop:"1em", paddingLeft:0, paddingRight:0}}>
          <SelectField
            aria-label="Leaf number"
            value={group.oddLeaf}
            maxHeight={200}
            width={50}
            onChange={(e, index, value)=>{props.onInputChangeCollationGroupsRows(e, group, "oddLeaf", value)}} 
            disabled={(!group.conjoin || group.leaves%2 === 0)}
            fullWidth
          >
            {menuItems(group.oddLeaf, unconjoinLeafsList, (!group.conjoin || group.leaves%2 === 0))}
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
      <div style={{width:"100%", margin: "auto", textAlign: "center"}}>
        <h1>Structure</h1>
        <p style={{paddingTop: 20}}>
          Pre-populate your collation with quires and leaves by using the formula below.  
          Generate the items by clicking the "Add" button.  You can add multiple times.
        </p>
        <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"space-evenly", alignItems: "center", padding:"1em 0em", background:"#f3f3f3"}}>
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
              onCheck={()=>props.set("conjoined", !props.conjoined)}
            />
          </div>
          <div>
            <RaisedButton 
              label="Add"
              aria-label="Add"
              onClick={() => props.addCollationRows()}
              primary
              keyboardFocused
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
              <TableBody displayRowCheckbox={false} style={{textAlign: "center"}}>
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
            label="Finish"
            aria-label="Finish"
            primary
            onClick={() => props.finish()}
          />:""}
        </div>
      </div>
    );
}
export default ProjectStructure;
