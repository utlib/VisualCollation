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
        insetChildren={true}
        checked={false}
        value={0}
        primaryText={""}
      />)
    }
    return unconjoinLeafsList.map((val) => (
      <MenuItem
        key={val}
        insetChildren={true}
        checked={selectedValue===val+1}
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
        <TableRowColumn style={{paddingTop:"1em",textAlign: "center"}}>{group.number}</TableRowColumn>
        <TableRowColumn style={{textAlign: "center"}}>
          <TextField
            id={group.number+"_number_of_leaves"}
            type="number"
            value={group.leaves}
            required
            min={1}
            onChange={(e)=>props.onInputChangeCollationGroupsRows(e, group, "leaves")}
            style={{width:50}}
          />
        </TableRowColumn>
        <TableRowColumn style={{paddingTop:"0.75em", textAlign: "center"}}>
            <Checkbox onCheck={() => props.handleToggleConjoin(group)}
                      checked={group.conjoin}
                      disabled={group.leaves<=1}
                      style={{marginLeft:8}}
            /> 
        </TableRowColumn>
        <TableRowColumn>
            <SelectField
              value={group.oddLeaf}
              maxHeight={200}
              autoWidth={true}
              onChange={(e, index, value)=>{props.onInputChangeCollationGroupsRows(e, group, "oddLeaf", value)}} 
              disabled={(!group.conjoin || group.leaves%2 === 0)}
            >
              {menuItems(group.oddLeaf, unconjoinLeafsList, (!group.conjoin || group.leaves%2 === 0))}
            </SelectField>
        </TableRowColumn>
        <TableRowColumn style={{textAlign: "center"}}>
          <IconButton 
              onTouchTap={() => props.handleRemoveCollationGroupRow(group.number)}
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
        <div style={{width: "100%", margin: "auto", display: "flex", justifyContent:"space-evenly", alignItems: "center"}}>
          <div>
            # of Quires 
          </div>
          <div>
            <TextField
              name="quireNo"
              value={props.quireNo}
              onChange={(event, newValue) => {props.set("quireNo", parseInt(newValue, 10))}}
              style={{width:50}}
              type="number"
            />
          </div>
          <div>
            &times;
            # of Leaves 
          </div>
          <div>
            <TextField
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
              checked={props.conjoined}
              onCheck={()=>props.set("conjoined", !props.conjoined)}
            />
          </div>
          <div>
            <RaisedButton 
              label="Add"
              onTouchTap={props.addCollationRows}
              primary
            />
          </div>
        </div>
        {collationGroupsRows.length>0?
          <div style={{paddingTop:20}}>
            <Table selectable={false} fixedHeader={false}>
              <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                <TableRow>
                  <TableHeaderColumn style={{textAlign: "center"}}>Quire no.</TableHeaderColumn>
                  <TableHeaderColumn>Number of leaves</TableHeaderColumn>
                  <TableHeaderColumn>Conjoin</TableHeaderColumn>
                  <TableHeaderColumn>Unconjoined leaf</TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false} style={{textAlign: "center"}}>
                {collationGroupsRows}
              </TableBody>
            </Table>
          </div> : 
          <div style={{paddingTop: 20}}>
            You can pre-populate your collation with quires and leaves by using the formula above.  
            Generate the groups and leaves by clicking the "Add" button.  You can add multiple times.
          </div>
        }
        
        <div style={{textAlign:"center",paddingTop:30}}>
          <FlatButton 
              label="Back"
              onTouchTap={props.previousStep}  
          />
          <RaisedButton 
            label="Finish"
            primary
            onTouchTap={props.finish}  
          />
        </div>
      </div>
    );
}
export default ProjectStructure;
