import React, {Component} from 'react';
import { connect } from "react-redux";
import FilterRow from '../components/filter/FilterRow';
import RaisedButton from 'material-ui/RaisedButton';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import Popover, {PopoverAnimationVertical} from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import ArrowDown from 'material-ui/svg-icons/navigation/arrow-drop-down'
import { 
  filterProject, 
  resetFilters,
  toggleFilterDisplay,
  updateFilterQuery,
  updateFilterSelection
} from "../actions/backend/filterActions";

/** Filter groups, leaves and sides */
class Filter extends Component {

  constructor(props) {
    super(props);
    this.state = {
      queries: props.queries,
      submitDisabled: false,
      conjoinedToAutoComplete: [],
      select: "",
      popoverAnchorEl: null,
      selectPopover: false,
      message: "",
      filterPanelHeight: '0',
    }
  }

  componentDidMount() {
    let conjoinedToAutoComplete = [];
    conjoinedToAutoComplete.push({
      text: 'None',
      value: 'None',
    });
    conjoinedToAutoComplete = [...conjoinedToAutoComplete, 
      ...this.props.leafIDs.map((id,index)=>{
        return {text: `Leaf ${index+1}`, value: id }
      })
    ]
    this.setState({
      conjoinedToAutoComplete, 
      filterPanelHeight: document.getElementById('filterContainer').offsetHeight
    });
  }

  componentWillReceiveProps(nextProps) {
    let conjoinedToAutoComplete = [];
    conjoinedToAutoComplete.push({
      text: 'None',
      value: 'None',
    });
    conjoinedToAutoComplete = [...conjoinedToAutoComplete, 
      ...this.props.leafIDs.map((id,index)=>{
        return {text: `Leaf ${index+1}`, value: id }
      })
    ]
    let matches = [];
    if (nextProps.groupMatches.length>0) {
      let plural = nextProps.groupMatches.length>1? "s" : "";
      matches.push(nextProps.groupMatches.length + " group" + plural);
    }
    if (nextProps.leafMatches.length>0) {
      let plural = nextProps.leafMatches.length>1? "ves" : "f";
      matches.push(nextProps.leafMatches.length + " lea" + plural);
    }
    if (nextProps.sideMatches.length>0) {
      let plural = nextProps.sideMatches.length>1? "s" : "";
      matches.push(nextProps.sideMatches.length + " side" + plural);
    }
    if (nextProps.noteMatches.length>0) {
      let plural = nextProps.noteMatches.length>1? "s" : "";
      matches.push(nextProps.noteMatches.length + " note" + plural);
    }
    let message = "No matches found."; 
    if (matches.length>0) {
        message = "Matches: " + matches.join(", ");
    }
    if (nextProps.queries.length===1 && 
      (nextProps.queries[0].type===null || nextProps.queries[0].attribute==="" 
      || nextProps.queries[0].condition===""||nextProps.queries[0].values.length===0)) {
      // Set message to empty if user cleared all filters
      message = "";
    }

    let filterPanelHeight = document.getElementById('filterContainer').offsetHeight;

    this.setState({
      queries: nextProps.queries, 
      conjoinedToAutoComplete, 
      message, filterPanelHeight
      });
  }

  removeRow = (queryIndex) => {
    let newQueries = this.state.queries;
    newQueries.splice(queryIndex,1);
    this.setState({ queries: newQueries}, ()=>{
      this.filter();
      this.props.filterHeightChange(document.getElementById('filterContainer').offsetHeight);
    });
  }

  addRow = () => {
    if (!this.disableAddRow()) {
      let newQueries = this.state.queries;
      newQueries.push({
        type: null,
        attribute: "",
        attributeIndex: "",
        values: [],
        condition: "",
        conjunction: "",
      })
      this.setState({ queries: newQueries}, () => {
        this.filter();
        this.props.filterHeightChange(document.getElementById('filterContainer').offsetHeight);
      });
    
    }
  }

  onChange = (queryIndex, fieldName, index, value, dataSource) => {
    if (dataSource){
      for (let member of dataSource){
        if (member.text===value){
          value = [member.value];
          break;
        }
      }
    }
    let updatedQueries = this.state.queries;
    if (["group", "leaf", "side", "note"].includes(value))
      updatedQueries = this.clearFilterRowOnType(queryIndex, value); 
    if (fieldName==="attribute") {
      updatedQueries[queryIndex]["attributeIndex"] = index;
    }
    updatedQueries[queryIndex][fieldName] = value;
    this.props.updateFilterQuery(updatedQueries);
    // If queries are valid, filter!
    let validQueries = true;
    for (let i=0; i<updatedQueries.length; i++) {
      // Check if this row of query is complete
      const isComplete = updatedQueries[i].type!==null && updatedQueries[i].attribute!=="" && updatedQueries[i].attributeIndex!=="" && updatedQueries[i].condition!=="" && updatedQueries[i].values.length>0 && updatedQueries[i].values.findIndex((value)=>value==="")<0;
      if (!isComplete) {
        validQueries = false;
        break;
      }
    }
    if (validQueries) this.filterProject();
  }

  filterProject = () => {
    // Check if correct values are being passed in auto-complete dropdown cases
    let toFilter = true;
    for (let query of this.state.queries){
      if ((query.type==="leaf" && query.attribute==="conjoined_leaf_order") ||
        (query.type==="note" && query.attribute==="type")){
        if (!Array.isArray(query.values)){
          toFilter = false;
          break;
        }
      }
    }
    if (toFilter) {
      this.props.filterProject(this.props.projectID, {queries: this.state.queries});
    }
  }

  resetFilters = () => {
    this.setState({
      queries: [
        {
          type: "",
          attribute: "",
          attributeIndex: "",
          values: [],
          condition: "",
          conjunction: "",
        }
      ],
    }, () => {
      this.props.resetFilters(this.state.queries);
      this.props.filterHeightChange(document.getElementById('filterContainer').offsetHeight);
    });
  }

  clearFilterRowOnType = (index, type) => {
    let queries = [];
    let currentIndex = 0;
    for (let query of this.state.queries) {
      if (currentIndex===index && type!==query.type)
        queries.push({
          type: type,
          attribute: "",
          attributeIndex: "",
          values: [],
          condition: "",
          conjunction: "",
        })
      else
        queries.push(query);
      currentIndex += 1;
    }
    return queries;
  }

  clearFilterRowOnAttribute = (index, attribute, attributeIndex) => {
    let queries = [];
    let currentIndex = 0;
    for (let query of this.state.queries) {
      if (currentIndex===index && attribute!==query.attribute && query.attribute!==""){
        queries.push({
          type: query.type,
          attribute: attribute,
          attributeIndex: attributeIndex,
          values: [],
          condition: "",
          conjunction: "",
        })
      }
      else
        queries.push(query);
      currentIndex += 1;
    }
    this.setState({queries}, () => this.props.resetFilters(queries))
  }


  filter = () => {
    let index = 0;
    let haveErrors = false
    for (let query of this.state.queries) {
      if (query.type === null)
        haveErrors = true
      if (query.attribute === "")
        haveErrors = true
      if (query.values.length === 0)
        haveErrors = true
      if (query.values.find((value)=>value==="")>=0)
        haveErrors = true
      if (query.condition === "")
        haveErrors = true
      if (index !== this.state.queries.length-1)
        if (query.conjunction === "")
          haveErrors = true
      index += 1;
    }
    if (!haveErrors) this.filterProject();
  }

  disableAddRow = () => {
    if (this.state.queries[this.state.queries.length-1].type === null)
      return true;
    if (this.state.queries[this.state.queries.length-1].attribute === "")
      return true;
    if (this.state.queries[this.state.queries.length-1].values.length === 0)
      return true;
    if (this.state.queries[this.state.queries.length-1].condition === "")
      return true;
    return false;
  }

  disableNewRow = () => {
    return (this.state.queries.length>1 && this.state.queries[this.state.queries.length-2].conjunction === "");
  }


  handleSelection = (selection) => {
    if (this.props.filterSelection!==selection || selection==="")
      this.props.updateFilterSelection(
        selection, 
        this.props.matchingFilterObjects,
        this.props.groupIDs,
        this.props.leafIDs,
        this.props.rectoIDs,
        this.props.versoIDs
      );
  }

  handleSelectOpen = (event) => {
    // This prevents ghost click.
    event.preventDefault();
    if (this.props.filterActive) {
      this.setState({
        selectPopover: true,
        popoverAnchorEl: event.currentTarget,
      });
    }
  }

  handleSelectClose = () => {
    this.setState({
      selectPopover: false,
    });
  };

  render() {
    let queries = [];
    if (this.state.queries && this.props.open)
      for (let i=0; i<this.state.queries.length; i++) {
        queries.push(
          <FilterRow 
            key={i}
            queryIndex={i}
            type={this.state.queries[i].type}
            attribute={this.state.queries[i].attribute}
            attributeIndex={this.state.queries[i].attributeIndex}
            values={this.state.queries[i].values}
            condition={this.state.queries[i].condition}
            conjunction={this.state.queries[i].conjunction}
            defaultAttributes={this.props.defaultAttributes}
            onChange={this.onChange}
            removeRow={this.removeRow}
            lastRow={i===this.state.queries.length-1}
            queriesLength={this.state.queries.length}
            noteTypes={this.props.noteTypes}
            clearFilterRowOnType={this.clearFilterRowOnType}
            clearFilterRowOnAttribute={this.clearFilterRowOnAttribute}
            conjoinedToAutoComplete={this.state.conjoinedToAutoComplete}
            addRow={this.addRow}
            disableAddRow={this.disableAddRow()}
            disableNewRow={i===(this.state.queries.length-1) && this.disableNewRow()}
            tabIndex={this.props.tabIndex}
          />
        );
      }
    let filterContainerStyle = this.props.open?{top:'56px'}:{top:'-'+this.state.filterPanelHeight+'px'};
    if (this.props.fullWidth) filterContainerStyle.width="100%";
    let panel = 
    <div role={this.props.open?"region":""} aria-label={this.props.open?"filter panel":""} className="filter" style={this.props.open?{opacity:1}:{opacity:0}}>
      <div id="filterContainer" className="filterContainer" style={filterContainerStyle}>
        {queries}
        <div style={{paddingLeft: 15, display: "flex", alignItems: "baseline", justifyContent:"space-between"}}>
          <div className="filterMessage">
            <p>{this.state.message}</p>
          </div>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <div style={{marginRight: 10}}>
            <Toggle
              label="Hide non-matches"
              aria-label="Hide non-matches"
              onClick={this.props.toggleFilterDisplay}
              disabled={!this.props.filterActive}
              style={(this.props.viewMode!=="TABULAR"||!this.props.open)? {display:"none"}:{width:"inherit"}}
              labelPosition="right"
              labelStyle={this.props.filterActive?{color:"rgb(82, 108, 145)", textTransform:"uppercase", fontWeight: 500, fontSize: 14}: {textTransform:"uppercase", fontWeight: 500, fontSize: 14}}
              tabIndex={this.props.tabIndex}
            />
            </div>
            <div style={{marginRight: 10}}>
            <RaisedButton
              onClick={this.handleSelectOpen}
              disabled={!this.props.filterActive}
              label={
                this.state.select==="" 
                  ? 
                "Select.." 
                  : 
                this.state.select.replace(/_/g, ' ')
              }
              labelPosition="before"
              icon={<ArrowDown />}
              tabIndex={this.props.tabIndex}
              style={this.props.open?{}:{display:"none"}}
            />
            <Popover
              open={this.state.selectPopover}
              anchorEl={this.state.popoverAnchorEl}
              onRequestClose={this.handleSelectClose}
              animation={PopoverAnimationVertical}
              disabled={!this.props.filterActive}
            >
              <Menu
                onChange={(e,v)=>{this.setState({select:v});this.handleSelection(v)}}
              >
                <MenuItem value={"Groups_matching"} primaryText="Select Matching Groups" disabled={this.props.groupMatches.length>0?false:true} />
                <MenuItem value={"Leafs_matching"} primaryText="Select Matching Leaves" disabled={this.props.leafMatches.length>0?false:true}/>
                <MenuItem value={"Rectos_matching"} primaryText="Select Matching Rectos" disabled={this.props.sideMatches.length>0?false:true}/>
                <MenuItem value={"Versos_matching"} primaryText="Select Matching Versos" disabled={this.props.sideMatches.length>0?false:true}/>
                {this.props.selectedObjects.members.length > 0 ? 
                  <MenuItem value={""} primaryText="Clear Selection" />
                  : null
                }
              </Menu>
            </Popover>
            </div>
            <div>
            <RaisedButton
              label="CLEAR FILTER"
              onClick={()=>this.resetFilters()}
              backgroundColor="#b53c3c"
              labelColor="#ffffff"
              tabIndex={this.props.tabIndex}
              style={this.props.open?{marginRight: 15}:{display:"none"}}
            />
            </div>
          </div>
        </div>
      </div>
      </div>
      return panel;
  }
}

const mapStateToProps = (state) => {
  return {
    projectID: state.active.project.id,
    selectedObjects: state.active.collationManager.selectedObjects,
    viewMode: state.active.collationManager.viewMode,
    defaultAttributes: state.active.collationManager.defaultAttributes,
    Groups: state.active.project.Groups,
    Leafs: state.active.project.Leafs,
    Rectos: state.active.project.Rectos,
    Versos: state.active.project.Versos,
    Notes: state.active.project.Notes,
    attachedToLeafs: state.active.project.attachedToLeafs,
    queries: state.active.collationManager.filters.queries,
    hideOthers: state.active.collationManager.filters.hideOthers,
    filterActive: state.active.collationManager.filters.active,
    filterSelection: state.active.collationManager.filters.selection,
    noteTypes: state.active.project.noteTypes,
    groupMatches: state.active.collationManager.filters.Groups,
    leafMatches: state.active.collationManager.filters.Leafs,
    sideMatches: state.active.collationManager.filters.Sides,
    noteMatches: state.active.collationManager.filters.Notes,
    matchingFilterObjects: state.active.collationManager.filters,
    leafIDs: state.active.project.leafIDs,
    groupIDs: state.active.project.groupIDs,
    rectoIDs: state.active.project.rectoIDs,
    versoIDs: state.active.project.versoIDs,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    filterProject: (projectID, queries) => {
      dispatch(filterProject(projectID, queries));
    },
    resetFilters: (queries) => {
      dispatch(resetFilters(queries));
    },
    toggleFilterDisplay: () => {
      dispatch(toggleFilterDisplay());
    },
    updateFilterQuery: (newQueries) => {
      dispatch(updateFilterQuery(newQueries));
    },
    updateFilterSelection: (
      selection, 
      matchingFilterObjects,
      GroupIDs,
      LeafIDs,
      RectoIDs,
      VersoIDs
    ) => {
      dispatch(updateFilterSelection(
        selection, 
        matchingFilterObjects,
        {GroupIDs, LeafIDs, RectoIDs, VersoIDs}
      ));
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Filter);
