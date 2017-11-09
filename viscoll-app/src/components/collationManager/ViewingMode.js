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
        spacing: 0.06,
        strokeWidth: 0.016,
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
        Notes: this.props.project.Notes,
        activeGroups: this.props.collationManager.selectedObjects.type==="Group"? this.props.collationManager.selectedObjects.members : [],
        activeLeafs: this.props.collationManager.selectedObjects.type==="Leaf"? this.props.collationManager.selectedObjects.members : [],
        activeRectos: this.props.collationManager.selectedObjects.type==="Recto"? this.props.collationManager.selectedObjects.members : [],
        activeVersos: this.props.collationManager.selectedObjects.type==="Verso"? this.props.collationManager.selectedObjects.members : [],
        flashItems: this.props.collationManager.flashItems,
        filters: this.props.collationManager.filters,
        visibleAttributes: this.props.collationManager.visibleAttributes,
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
      this.props.collationManager.visibleAttributes !== nextProps.collationManager.visibleAttributes ||
      this.props.project.Notes!==nextProps.project.Notes
    );
  }

  componentWillUpdate(nextProps) {
    if (Object.keys(this.state.paperManager).length>0) {
      this.state.paperManager.setProject(nextProps.project);
      this.state.paperManager.setActiveGroups(nextProps.collationManager.selectedObjects.type==="Group"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveLeafs(nextProps.collationManager.selectedObjects.type==="Leaf"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveRectos(nextProps.collationManager.selectedObjects.type==="Recto"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setActiveVersos(nextProps.collationManager.selectedObjects.type==="Verso"? nextProps.collationManager.selectedObjects.members : []);
      this.state.paperManager.setFilter(nextProps.collationManager.filters);
      this.state.paperManager.setVisibility(nextProps.collationManager.visibleAttributes);
      this.drawOnCanvas();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.drawOnCanvas);
  }

  /**
   * Draw canvas
   * @public
   */
  drawOnCanvas = () => {
    // Create leaves through manager
    this.updateCanvasSize();
    this.state.paperManager.draw();
  }

  /**
   * Update canvas size based on current window size
   * @public
   */
  updateCanvasSize = () => {
    // Resize the canvas
    let maxWidth = window.innerWidth-window.innerWidth*0.75;
    document.getElementById("myCanvas").width=maxWidth;
    this.state.paperManager.setWidth(maxWidth);
  }
    

  render() {
    let canvasAttr = {
      'data-paper-hidpi': 'off',
      'height': "99999999px",
      'width': window.innerWidth-window.innerWidth*0.75,
    };


    let leafID, rectoURL, versoURL;
    if (this.props.selectedObjects.type==="Leaf"){
      leafID = this.props.selectedObjects.members[0];
      const leaf = this.props.project.Leafs[leafID];
      const recto = this.props.project.Rectos[leaf.rectoID];
      const verso = this.props.project.Versos[leaf.versoID];
      rectoURL = recto.image.url;
      versoURL = verso.image.url;
    } else if (this.props.selectedObjects.type==="Recto") {
      const recto = this.props.project.Rectos[this.props.selectedObjects.members[0]];
      rectoURL = recto.image.url;
    } else if (this.props.selectedObjects.type==="Verso") {
      const verso = this.props.project.Versos[this.props.selectedObjects.members[0]];
      versoURL = verso.image.url;
    }

    return (
    <div className="viewingMode">
      <div style={{width: "40%"}}>
        <canvas id="myCanvas" {...canvasAttr}></canvas>
      </div>
      <ImageViewer rectoURL={rectoURL} versoURL={versoURL} fixed={true} />
    </div>
    );
  }
}
