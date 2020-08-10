import React from 'react';
import PaperManager from '../../assets/visualMode/PaperManager.js';

/** Contains the collation drawing in a canvas element */
export default class VisualMode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paperManager: {},
    };
  }

  componentDidMount() {
    this.props.toggleVisualizationDrawing({ type: 'tacketed', value: '' });
    this.props.toggleVisualizationDrawing({ type: 'sewing', value: '' });
    window.addEventListener('resize', this.drawOnCanvas);
    this.setState(
      {
        paperManager: new PaperManager({
          canvasID: 'myCanvas',
          origin: 0,
          spacing: 0.04,
          strokeWidth: 0.015,
          strokeColor: 'rgb(82,108,145)',
          strokeColorActive: 'rgb(78,214,203)',
          strokeColorGroupActive: 'rgb(82,108,145)',
          strokeColorFilter: '#95fff6',
          strokeColorAdded: '#5F95D6',
          groupColor: '#e7e7e7',
          groupColorActive: 'rgb(78,214,203)',
          groupTextColor: '#727272',
          strokeColorTacket: '#4e4e4e',
          handleObjectClick: this.props.handleObjectClick,
          groupIDs: this.props.project.groupIDs,
          leafIDs: this.props.project.leafIDs,
          Groups: this.props.project.Groups,
          Leafs: this.props.project.Leafs,
          Rectos: this.props.project.Rectos,
          Versos: this.props.project.Versos,
          Notes: this.props.project.Notes,
          activeGroups:
            this.props.collationManager.selectedObjects.type === 'Group'
              ? this.props.collationManager.selectedObjects.members
              : [],
          activeLeafs:
            this.props.collationManager.selectedObjects.type === 'Leaf'
              ? this.props.collationManager.selectedObjects.members
              : [],
          activeRectos:
            this.props.collationManager.selectedObjects.type === 'Recto'
              ? this.props.collationManager.selectedObjects.members
              : [],
          activeVersos:
            this.props.collationManager.selectedObjects.type === 'Verso'
              ? this.props.collationManager.selectedObjects.members
              : [],
          flashItems: this.props.collationManager.flashItems,
          filters: this.props.collationManager.filters,
          visibleAttributes: this.props.project.preferences,
          toggleVisualizationDrawing: this.props.toggleVisualizationDrawing,
          addVisualization: this.addVisualization,
          openNoteDialog: this.props.openNoteDialog,
          notationStyle: this.props.project.notationStyle,
        }),
      },
      () => {
        this.drawOnCanvas();
      }
    );
  }
  componentWillUnmount() {
    this.props.toggleVisualizationDrawing({ type: 'tacketed', value: '' });
    this.props.toggleVisualizationDrawing({ type: 'sewing', value: '' });
    this.state.paperManager.deactivateTacketTool();
    window.removeEventListener('resize', this.drawOnCanvas);
  }

  shouldComponentUpdate(nextProps) {
    return (
      this.props.project.Groups !== nextProps.project.Groups ||
      this.props.project.Sides !== nextProps.project.Sides ||
      this.props.project.Rectos !== nextProps.project.Rectos ||
      this.props.project.Versos !== nextProps.project.Versos ||
      this.props.project.Notes !== nextProps.project.Notes ||
      this.props.collationManager.selectedObjects !==
        nextProps.collationManager.selectedObjects ||
      this.props.collationManager.flashItems !==
        nextProps.collationManager.flashItems ||
      this.props.collationManager.filters !==
        nextProps.collationManager.filters ||
      this.props.project.preferences !== nextProps.project.preferences ||
      this.props.tacketed !== nextProps.tacketed ||
      this.props.sewing !== nextProps.sewing
    );
  }

  componentWillUpdate(nextProps) {
    if (Object.keys(this.state.paperManager).length > 0) {
      this.state.paperManager.setProject(nextProps.project);
      this.state.paperManager.setFlashItems(
        nextProps.collationManager.flashItems
      );
      this.state.paperManager.setActiveGroups(
        nextProps.collationManager.selectedObjects.type === 'Group'
          ? nextProps.collationManager.selectedObjects.members
          : []
      );
      this.state.paperManager.setActiveLeafs(
        nextProps.collationManager.selectedObjects.type === 'Leaf'
          ? nextProps.collationManager.selectedObjects.members
          : []
      );
      this.state.paperManager.setActiveRectos(
        nextProps.collationManager.selectedObjects.type === 'Recto'
          ? nextProps.collationManager.selectedObjects.members
          : []
      );
      this.state.paperManager.setActiveVersos(
        nextProps.collationManager.selectedObjects.type === 'Verso'
          ? nextProps.collationManager.selectedObjects.members
          : []
      );
      this.state.paperManager.setFilter(nextProps.collationManager.filters);
      this.state.paperManager.setVisibility(nextProps.project.preferences);
      this.drawOnCanvas();
      if (nextProps.tacketed !== '') {
        this.state.paperManager.activateTacketTool(nextProps.tacketed);
      } else if (nextProps.sewing !== '') {
        this.state.paperManager.activateTacketTool(nextProps.sewing, 'sewing');
      } else {
        this.state.paperManager.deactivateTacketTool();
      }
    }
  }

  addVisualization = (groupID, type, leafIDs) => {
    let updatedGroup = {
      [type]: leafIDs,
    };
    this.props.updateGroup(groupID, updatedGroup);
  };

  /**
   * Update canvas size based on current window size
   */
  updateCanvasSize = () => {
    // Resize the canvas
    let maxWidth = window.innerWidth - window.innerWidth * 0.46;
    document.getElementById('myCanvas').width = maxWidth;
    this.state.paperManager.setWidth(maxWidth);
  };

  /**
   * Draw canvas
   */
  drawOnCanvas = () => {
    // Create leaves through manager
    this.updateCanvasSize();
    this.state.paperManager.draw();
  };

  render() {
    let canvasAttr = {
      'data-paper-hidpi': 'off',
      height: '99999999px',
      width: window.innerWidth - window.innerWidth * 0.46,
    };
    return (
      <div>
        <canvas id="myCanvas" {...canvasAttr}></canvas>
      </div>
    );
  }
}
