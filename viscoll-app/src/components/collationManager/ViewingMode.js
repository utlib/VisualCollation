import React from 'react';
import PaperManager from "../../assets/visualMode/PaperManager.js";
import ImageViewer from "../global/ImageViewer";

/** Contains the collation drawing in a canvas element */
export default class ViewingMode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paperManager: {},
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.drawOnCanvas);
    this.setState({
      paperManager: new PaperManager({
        canvasID: 'myCanvas',
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
        groupIDs: this.props.project.groupIDs,
        leafIDs: this.props.project.leafIDs,
        Groups: this.props.project.Groups,
        Leafs: this.props.project.Leafs,
        Rectos: this.props.project.Rectos,
        Versos: this.props.project.Versos,
        Terms: this.props.project.Terms,
        activeGroups: this.props.collationManager.selectedObjects.type==="Group"? this.props.collationManager.selectedObjects.members : [],
        activeLeafs: this.props.collationManager.selectedObjects.type==="Leaf"? this.props.collationManager.selectedObjects.members : [],
        activeRectos: this.props.collationManager.selectedObjects.type==="Recto"? this.props.collationManager.selectedObjects.members : [],
        activeVersos: this.props.collationManager.selectedObjects.type==="Verso"? this.props.collationManager.selectedObjects.members : [],
        flashItems: this.props.collationManager.flashItems,
        filters: this.props.collationManager.filters,
        visibleAttributes: this.props.project.preferences,
        toggleTacket: this.props.toggleTacket,
        addTacket: this.addTacket,
        viewingMode: true,
      })
    }, ()=>{this.drawOnCanvas();});
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.collationManager.selectedObjects!==nextProps.collationManager.selectedObjects ||
      this.props.collationManager.filters !== nextProps.collationManager.filters ||
      this.props.project.preferences !== nextProps.project.preferences ||
      this.props.project.Terms!==nextProps.project.Terms ||
      this.state.viewingMode !== nextState.viewingMode ||
      this.props.imageViewerEnabled !== nextProps.imageViewerEnabled
    );
  }

  componentWillUpdate(nextProps, nextState) {
    if (Object.keys(this.state.paperManager).length>0) {
      this.state.paperManager.setProject(nextProps.project);
      this.state.paperManager.setActiveGroups(nextProps.collationManager.selectedObjects.type==="Group"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveLeafs(nextProps.collationManager.selectedObjects.type==="Leaf"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveRectos(nextProps.collationManager.selectedObjects.type==="Recto"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveVersos(nextProps.collationManager.selectedObjects.type==="Verso"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setFilter(nextProps.collationManager.filters);
      this.state.paperManager.setVisibility(nextProps.project.preferences);
    }
  }

  componentDidUpdate() {
    this.drawOnCanvas();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.drawOnCanvas);
  }

  /**
   * Draw canvas
   */
  drawOnCanvas = () => {
    // Create leaves through manager
    this.updateCanvasSize();
    this.state.paperManager.draw();
  }
  /**
   * Update canvas size based on current window size
   */
  updateCanvasSize = () => {
    // Resize the canvas
    let maxWidth = window.innerWidth-window.innerWidth*0.46;
    if (this.props.imageViewerEnabled) {
      maxWidth = window.innerWidth-window.innerWidth*0.75;
    }
    document.getElementById("myCanvas").width=maxWidth;
    this.state.paperManager.setWidth(maxWidth);
    if (this.props.imageViewerEnabled) {
      this.state.paperManager.setScale(0.06, 0.027);
    } else {
      this.state.paperManager.setScale(0.04, 0.015);
    }
  }
    
  render() {
    let canvasAttr = {
      'data-paper-hidpi': 'off',
      'height': "99999999px",
      'width': this.props.imageViewerEnabled? window.innerWidth-window.innerWidth*0.75: window.innerWidth-window.innerWidth*0.46,
    };

    let leafID, leaf, recto, verso, isRectoDIY, isVersoDIY, rectoURL, versoURL;
    if (this.props.selectedObjects.type==="Leaf"){
      leafID = this.props.selectedObjects.members[0];
      leaf = this.props.project.Leafs[leafID];
      recto = this.props.project.Rectos[leaf.rectoID];
      verso = this.props.project.Versos[leaf.versoID];
    } else if (this.props.selectedObjects.type==="Recto") {
      recto = this.props.project.Rectos[this.props.selectedObjects.members[0]];
    } else if (this.props.selectedObjects.type==="Verso") {
      verso = this.props.project.Versos[this.props.selectedObjects.members[0]];
    }
    isRectoDIY = recto!==undefined && recto.image.manifestID!==undefined && recto.image.manifestID.includes("DIY");
    isVersoDIY = verso!==undefined && verso.image.manifestID!==undefined && verso.image.manifestID.includes("DIY");
    rectoURL = recto!==undefined && recto.image.url!==undefined? recto.image.url : null;
    versoURL = verso!==undefined && verso.image.url!==undefined? verso.image.url : null;
    return (
    <div className="viewingMode">
      <div style={this.props.imageViewerEnabled?{width: "40%"}:{}}>
        
        <canvas id="myCanvas" {...canvasAttr}></canvas>
      </div>
      {this.props.imageViewerEnabled?
        <ImageViewer isRectoDIY={isRectoDIY} isVersoDIY={isVersoDIY} rectoURL={rectoURL} versoURL={versoURL} fixed={true} />
        :""
      }
    </div>
    );
  }
}
