import React from 'react';
import PaperManager from "../../assets/visualMode/export/PaperManager.js";

/** Contains the collation drawing in a canvas element */
export default class ExportMode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paperManagers: [],
    };
  }

  getChildrenByType = (type, memberIDs) => {
    let ids = [];
    for (let id of memberIDs) {
      if (id.includes(type)) ids.push(id);
      if (id.includes('Group')) {
        let itemMembers = this.props.project.Groups[id].memberIDs;
        ids = [...ids, ...this.getChildrenByType(type, itemMembers)];
      }
    }
    return ids;
  }

  componentDidMount() {
    this.props.toggleVisualizationDrawing({type:"tacketed", value: ""});
    this.props.toggleVisualizationDrawing({type:"sewing", value: ""});
    window.addEventListener("resize", this.drawOnCanvas);
    this.updatePM();
  }

  componentWillUnmount() {
    this.props.toggleVisualizationDrawing({type:"tacketed", value: ""});
    this.props.toggleVisualizationDrawing({type:"sewing", value: ""});
    // this.state.paperManager.deactivateTacketTool();
    window.removeEventListener("resize", this.drawOnCanvas);
  }

  shouldComponentUpdate(nextProps) {
    return (this.props.project.Groups!==nextProps.project.Groups || 
      this.props.project.Sides!==nextProps.project.Sides || 
      this.props.project.Rectos!==nextProps.project.Rectos || 
      this.props.project.Versos!==nextProps.project.Versos ||
      this.props.project.Notes!==nextProps.project.Notes ||
      this.props.collationManager.selectedObjects!==nextProps.collationManager.selectedObjects ||
      this.props.collationManager.flashItems !== nextProps.collationManager.flashItems ||
      this.props.collationManager.filters !== nextProps.collationManager.filters ||
      this.props.project.preferences !== nextProps.project.preferences ||
      this.props.tacketed !== nextProps.tacketed || 
      this.props.sewing !== nextProps.sewing ||
      this.props.showNotes !== nextProps.showNotes
    );
  }

  componentDidUpdate() {
    this.updatePM();
  }

  updatePM = () => {
    let pm = [];
    for (let [i, [groupID, group]] of Object.entries(this.props.project.Groups).entries()) {
      if (group.nestLevel > 1) continue;
      // Filter leaf ids for this group only
      let memberLeafIDs = this.getChildrenByType('Leaf', group.memberIDs);
      let memberGroupIDs = this.getChildrenByType('Group', group.memberIDs);
      let memberGroups = {};
      memberGroups[groupID] = this.props.project.Groups[groupID];
      for (let id of memberGroupIDs) {
        memberGroups[id] = this.props.project.Groups[id];
      }
      pm.push(
        new PaperManager({
          canvasID: 'canvas'+i,
          origin: 0,
          spacing: 0.04,
          strokeWidth: 0.015,
          strokeColor: 'rgb(82,108,145)',
          strokeColorActive: 'rgb(78,214,203)',
          strokeColorGroupActive: 'rgb(82,108,145)',
          strokeColorFilter: '#95fff6',
          strokeColorAdded: "#5F95D6",
          groupColor: '#e7e7e7',
          groupColorActive: 'rgb(78,214,203)',
          groupTextColor: "#727272",
          strokeColorTacket: "#4e4e4e",
          handleObjectClick: this.props.handleObjectClick,
          groupIDs: [this.props.project.groupIDs[i], ...memberGroupIDs],
          leafIDs: memberLeafIDs,
          allLeafIDs: this.props.project.leafIDs,
          allGroupIDs: this.props.project.groupIDs,
          Groups: memberGroups,
          Leafs: this.props.project.Leafs,
          Rectos: this.props.project.Rectos,
          Versos: this.props.project.Versos,
          Notes: this.props.project.Notes,
          activeGroups: this.props.collationManager.selectedObjects.type==="Group"? this.props.collationManager.selectedObjects.members : [],
          activeLeafs: this.props.collationManager.selectedObjects.type==="Leaf"? this.props.collationManager.selectedObjects.members : [],
          activeRectos: this.props.collationManager.selectedObjects.type==="Recto"? this.props.collationManager.selectedObjects.members : [],
          activeVersos: this.props.collationManager.selectedObjects.type==="Verso"? this.props.collationManager.selectedObjects.members : [],
          flashItems: this.props.collationManager.flashItems,
          filters: this.props.collationManager.filters,
          visibleAttributes: this.props.project.preferences,
          toggleVisualizationDrawing: this.props.toggleVisualizationDrawing,
          addVisualization: this.addVisualization,
          openNoteDialog: this.props.openNoteDialog,
          showNotes: this.props.showNotes
        })
      )
    }
    this.setState({paperManagers:pm}, ()=>{this.drawOnCanvas();});
  }

  addVisualization = (groupID, type, leafIDs) => {
    let updatedGroup = {
      [type]: leafIDs,
    }
    this.props.updateGroup(groupID, updatedGroup);
  }

  /**
   * Update canvas size based on current window size
   */
  updateCanvasSize = () => {
    // Resize the canvas
    let maxWidth = window.innerWidth-window.innerWidth*0.46;
    document.getElementById("myCanvas").width=maxWidth;
  }
  
  /**
   * Draw canvas
   */
  drawOnCanvas = () => {
    // Create leaves through manager
    for (let i = 0; i < this.state.paperManagers.length; i++) {
      this.state.paperManagers[i].draw();
    }
  }
  
  render() {
    let canvases = [];
    let canvasAttr = {
      'data-paper-hidpi': 'off',
      'height': '500',
      'width': window.innerWidth-window.innerWidth*0.46,
    };
    for (let [i, [, group]] of Object.entries(this.props.project.Groups).entries()) {
      if (group.nestLevel === 1) {
        canvases.push(<canvas key={"canvas"+i} id={"canvas"+i} {...canvasAttr}></canvas>)
      }
    }
    return (
        <div>
          {canvases}
        </div>
    );
  }
}
