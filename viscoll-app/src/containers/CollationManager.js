import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';
import TabularMode from '../components/collationManager/TabularMode';
import VisualMode from '../components/collationManager/VisualMode';
import ExportMode from '../components/collationManager/ExportMode';
import ViewingMode from '../components/collationManager/ViewingMode';
import Panel from '../components/global/Panel';
import Export from '../components/export/Export';
import InfoBox from './InfoBox';
import Filter from './Filter';
import TopBar from './TopBar';
import topbarStyle from '../styles/topbar';
import IconClear from 'material-ui/svg-icons/content/clear';
import IconButton from 'material-ui/IconButton';
import { RadioButton, RadioButtonGroup } from 'material-ui/RadioButton';
import { connect } from 'react-redux';
import {
  changeViewMode,
  handleObjectClick,
  handleObjectPress,
  changeManagerMode,
  toggleFilterPanel,
  toggleVisualizationDrawing,
} from '../actions/backend/interactionActions';
import {
  updateFilterSelection,
  reapplyFilterProject,
} from '../actions/backend/filterActions';
import { updateGroup } from '../actions/backend/groupActions';
import {
  updateNote,
  deleteNote,
  linkNote,
  unlinkNote,
} from '../actions/backend/noteActions';
import {
  loadProject,
  exportProject,
  updateProject,
} from '../actions/backend/projectActions';
import fileDownload from 'js-file-download';
import NoteDialog from '../components/collationManager/dialog/NoteDialog';
import { radioBtnDark } from '../styles/button';
import ManagersPanel from '../components/global/ManagersPanel';

/** Container for `TabularMode`, `VisualMode`, `InfoBox`, `TopBar`, `LoadingScreen`, and `Notification`. This container has the project sidebar embedded directly.  */
class CollationManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: window.innerWidth,
      contentStyle: {
        transition: 'top 450ms cubic-bezier(0.23, 1, 0.32, 1)',
        top: 40,
      },
      infoboxStyle: {
        maxHeight: '90%',
      },
      export: {
        open: false,
        label: '',
        type: '',
        exportCols: 1,
        exportNotes: true,
      },
      selectAll: '',
      leftSideBarOpen: true,
      showTips: props.preferences.showTips,
      imageViewerEnabled: false,
      activeNote: null,
      tipIndex: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resizeHandler);
    if (this.props.filterPanelOpen) {
      let filterContainer = document.getElementById('filterContainer');
      if (filterContainer) {
        let filterPanelHeight = filterContainer.offsetHeight;
        this.filterHeightChange(filterPanelHeight);
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  componentWillReceiveProps(nextProps) {
    const newSelectedObjects =
      nextProps.selectedObjects !== this.props.selectedObjects;
    const differentNumOfSelectedObjects =
      this.state.selectAll &&
      nextProps.selectedObjects.members.length !==
        Object.keys(this.props.project[this.state.selectAll]).length;
    const differentTypeOfSelectedObjects =
      this.state.selectAll !== nextProps.selectedObjects.type + 's';
    if (
      this.state.selectAll &&
      newSelectedObjects &&
      (differentTypeOfSelectedObjects || differentNumOfSelectedObjects)
    ) {
      this.setState({ selectAll: '' });
    }
    if (
      nextProps.selectedObjects.type &&
      Object.keys(nextProps.project[nextProps.selectedObjects.type + 's'])
        .length === nextProps.selectedObjects.members.length
    ) {
      this.setState({ selectAll: nextProps.selectedObjects.type + 's' });
    }

    // Update active note
    const commonNotes = this.getCommonNotes(nextProps);
    if (
      this.state.activeNote !== null &&
      commonNotes.findIndex(noteID => noteID === this.state.activeNote.id) <
        0 &&
      !this.state.clickedFromDiagram
    ) {
      // Hide note when note was clicked from infobox and removed from selected object
      this.setState({ activeNote: null });
    } else if (this.state.activeNote) {
      // Update note object
      this.setState({
        activeNote: nextProps.project.Notes[this.state.activeNote.id],
      });
    }
  }

  resizeHandler = () => {
    this.setState({ windowWidth: window.innerWidth });
  };

  toggleFilterDrawer = () => {
    this.props.toggleFilterPanel(!this.props.filterPanelOpen);
    let filterPanelHeight = document.getElementById('filterContainer')
      .offsetHeight;
    if (this.props.filterPanelOpen) {
      filterPanelHeight = 0;
    }
    this.filterHeightChange(filterPanelHeight);
  };

  handleObjectPress = (object, event) => {
    this.props.handleObjectPress(this.props.selectedObjects, object, event);
  };

  handleObjectClick = (object, event) => {
    event.stopPropagation();
    this.props.handleObjectClick(
      this.props.selectedObjects,
      object,
      event,
      this.props.project.groupIDs,
      this.props.project.leafIDs,
      this.props.project.rectoIDs,
      this.props.project.versoIDs
    );
  };

  handleViewModeChange = value => {
    if (value === 'VIEWING') {
      this.setState({ leftSideBarOpen: true, imageViewerEnabled: false }, () =>
        this.props.changeViewMode(value)
      );
    } else if (value !== 'VIEWING' && this.state.leftSideBarOpen === false) {
      this.setState({ leftSideBarOpen: true }, () =>
        this.props.changeViewMode(value)
      );
    } else {
      this.props.changeViewMode(value);
    }
  };

  filterHeightChange = value => {
    let infoboxHeight = '90%';
    if (value > 0) infoboxHeight = window.innerHeight - value - 56 - 30 + 'px';
    this.setState({
      contentStyle: { ...this.state.contentStyle, top: value + 56 },
      infoBoxStyle: { maxHeight: infoboxHeight },
    });
  };

  updateGroup = (groupID, group) => {
    this.props.updateGroup(groupID, group, this.props);
  };

  closeTip = () => {
    const project = {
      preferences: {
        showTips: false,
      },
    };
    this.props.hideProjectTip();
    this.props.updateProject(project, this.props.project.id);
  };

  handleSelection = selection => {
    this.props.updateFilterSelection(
      selection,
      this.props.project.groupIDs,
      this.props.project.leafIDs,
      this.props.project.rectoIDs,
      this.props.project.versoIDs
    );
  };

  handleExportToggle = (open, type, label, exportCols, exportNotes) => {
    this.setState(
      { export: { open, type, label, exportCols, exportNotes } },
      () => {
        if (this.state.export.open && type !== 'png' && type !== 'share')
          this.props.exportProject(this.props.project.id, type);
      }
    );
    this.props.togglePopUp(open);
  };

  showCopyToClipboardNotification = () => {
    this.props.showCopyToClipboardNotification();
  };

  numRootGroups = () => {
    let numRootGroups = 0;
    for (let [, [, group]] of Object.entries(
      this.props.project.Groups
    ).entries()) {
      if (group.nestLevel === 1) {
        numRootGroups++;
      }
    }
    return numRootGroups;
  };

  combineDiagram = () => {
    // Resize export canvas
    let finalCanvas = document.getElementById('exportCanvas');
    let canvasIDs = Array(this.numRootGroups())
      .fill()
      .map((v, i) => 'canvas' + i);
    let canvases = [];
    for (let id of canvasIDs) {
      canvases.push(document.getElementById(id));
    }
    let rows = [];
    let numCols = parseInt(this.state.export.exportCols);
    for (let i = 0; i < canvases.length; i += numCols) {
      rows.push(canvases.slice(i, i + numCols));
    }
    let exportWidth = 0;
    for (let i = 0; i < numCols; i++) {
      exportWidth += canvases[i].width;
    }
    let exportHeight = 0;
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let maxRowHeight = 0;
      for (let j = 0; j < row.length; j++) {
        maxRowHeight = Math.max(maxRowHeight, row[j].height);
      }
      exportHeight += maxRowHeight;
    }
    finalCanvas.width = exportWidth;
    finalCanvas.height = exportHeight;

    // Combine canvases
    let finalContext = finalCanvas.getContext('2d');
    let globalY = 0;
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let x = 0;
      let currentY = globalY;
      let currentLargestY = 0;
      for (let j = 0; j < row.length; j++) {
        let canvas = row[j];
        finalContext.drawImage(canvas, x, currentY);
        x += canvas.width;
        currentLargestY = Math.max(currentLargestY, canvas.height);
      }
      globalY += currentLargestY;
    }
  };

  handleDownloadCollationDiagram = () => {
    let canvas = document.getElementById('exportCanvas');
    canvas.toBlob(blob => {
      const filename = this.props.project.title.replace(/\s/g, '_');
      fileDownload(blob, `${filename}.PNG`);
    });
  };

  toggleImageViewer = () => {
    this.setState({
      imageViewerEnabled: !this.state.imageViewerEnabled,
      leftSideBarOpen: !this.state.leftSideBarOpen,
    });
  };

  closeNoteDialog = () => {
    this.setState({ activeNote: null, clickedFromDiagram: false }, () =>
      this.props.togglePopUp(false)
    );
  };
  openNoteDialog = (note, clickedFromDiagram = false) => {
    this.setState({ activeNote: note, clickedFromDiagram }, () =>
      this.props.togglePopUp(true)
    );
  };

  getCommonNotes = (props = this.props) => {
    // Find the common notes of all currently selected objects
    const memberType = props.selectedObjects.type;
    const members = props.selectedObjects.members;
    let notes = [];
    if (members.length > 0) {
      notes = props.project[memberType + 's'][members[0]].notes;
      for (let id of members) {
        notes = this.intersect(
          notes,
          props.project[memberType + 's'][id].notes
        );
      }
    }
    return notes;
  };

  /**
   * Returns items in common
   */
  intersect = (list1, list2) => {
    if (list1.length >= list2.length)
      return list1.filter(id1 => {
        return list2.includes(id1);
      });
    else
      return list2.filter(id1 => {
        return list1.includes(id1);
      });
  };

  updateNote = (noteID, note) => {
    this.props.updateNote(
      noteID,
      note,
      this.props.project.id,
      this.props.collationManager.filters
    );
  };

  linkDialogNote = (noteID, objects) => {
    this.props.linkNote(
      noteID,
      objects,
      this.props.project.id,
      this.props.collationManager.filters
    );
  };

  linkAndUnlinkNotes = (noteID, linkObjects, unlinkObjects) => {
    this.props.linkAndUnlinkNotes(
      noteID,
      linkObjects,
      unlinkObjects,
      this.props.project.id,
      this.props.collationManager.filters
    );
  };

  unlinkDialogNote = (noteID, objects) => {
    this.props.unlinkNote(
      noteID,
      objects,
      this.props.project.id,
      this.props.collationManager.filters
    );
  };

  deleteNote = noteID => {
    this.closeNoteDialog();
    this.props.deleteNote(
      noteID,
      this.props.project.id,
      this.props.collationManager.filters
    );
  };

  renderRadioButton = (value, label) => {
    return (
      <RadioButton
        value={value}
        aria-label={label}
        label={label}
        selected={true}
        tabIndex={this.props.popUpActive ? -1 : 0}
        {...radioBtnDark()}
      />
    );
  };

  setExport = (name, value) => {
    this.setState({ export: { ...this.state.export, [name]: value } });
  };

  render() {
    const containerStyle = {
      top: 85,
      right: '2%',
      height: 'inherit',
      maxHeight: '80%',
      width: '28%',
    };
    if (!this.state.leftSideBarOpen) {
      containerStyle['width'] = '30%';
    }

    const topbar = (
      <TopBar
        toggleFilterDrawer={this.toggleFilterDrawer}
        filterOpen={this.props.filterPanelOpen}
        viewMode={this.props.collationManager.viewMode}
        history={this.props.history}
        showImageViewerButton={
          this.props.collationManager.viewMode === 'VIEWING'
        }
        imageViewerEnabled={this.state.imageViewerEnabled}
        toggleImageViewer={this.toggleImageViewer}
        tabIndex={this.props.popUpActive ? -1 : 0}
        togglePopUp={this.props.togglePopUp}
        popUpActive={this.props.popUpActive}
        windowWidth={this.state.windowWidth}
        showUndoRedo={this.props.collationManager.viewMode !== 'VIEWING'}
      >
        <Tabs
          tabItemContainerStyle={{ backgroundColor: '#ffffff' }}
          value={this.props.collationManager.viewMode}
          onChange={this.handleViewModeChange}
        >
          <Tab
            label="Visual Mode"
            value="VISUAL"
            buttonStyle={topbarStyle().tab}
            tabIndex={this.props.popUpActive ? -1 : 0}
          />
          <Tab
            label="Tabular Mode"
            value="TABULAR"
            buttonStyle={topbarStyle().tab}
            tabIndex={this.props.popUpActive ? -1 : 0}
          />
          <Tab
            label="Viewing Mode"
            value="VIEWING"
            buttonStyle={topbarStyle().tab}
            tabIndex={this.props.popUpActive ? -1 : 0}
          />
        </Tabs>
      </TopBar>
    );

    const singleEditTip =
      'Hold the CTRL key (or Command key for Mac users) to select multiple groups/leaves/sides. Hold SHIFT key to select a range of groups/leaves/sides.';
    const batchEditTip =
      'You are in batch edit mode. To leave this mode, click on any group/leaf/side without holding down any keys.';
    const tip = [
      this.props.selectedObjects.members.length > 1
        ? batchEditTip
        : singleEditTip,
      "Generate folio/page numbers by selecting multiple leaves and clicking on the 'Generate folio/page numbers' button in the infobox on the right.",
      'View a zoomed out version of the collation diagram by selecting PNG export in the Export section of this sidebar.',
      'Undo an action with CTRL+Z (or CMD+Z for Mac users), and redo an action with CTRL+Y (or CMD+Y for Mac users).',
    ];
    let tipsDiv;
    if (
      this.props.managerMode === 'collationManager' &&
      this.props.preferences.showTips === true
    ) {
      tipsDiv = (
        <div className="selectMode">
          <div className="close">
            <IconButton
              aria-label="Close tip panel"
              onClick={this.closeTip}
              style={{ width: 'inherit', height: 'inherit', padding: 0 }}
              iconStyle={{ color: '#526C91' }}
              tabIndex={this.props.popUpActive ? -1 : 0}
            >
              <IconClear />
            </IconButton>
          </div>
          <div className="tip">
            <span>TIP:</span> {tip[this.state.tipIndex]}
            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                name="Next tip"
                aria-label="Next tip"
                onClick={() =>
                  this.setState({
                    tipIndex: (this.state.tipIndex + 1) % tip.length,
                  })
                }
                tabIndex={this.props.popUpActive ? -1 : 0}
                style={{ color: '#4ED6CB', background: 'none', border: 0 }}
              >
                Next tip &#10095;
              </button>
            </div>
          </div>
        </div>
      );
    }

    const selectionRadioGroup = (
      <RadioButtonGroup
        name="selectionRadioGroup"
        defaultSelected={this.state.selectAll}
        valueSelected={this.state.selectAll}
        onChange={(e, v) =>
          this.setState({ selectAll: v }, () => {
            this.handleSelection(v + '_all');
          })
        }
      >
        {this.renderRadioButton('Groups', 'Select All Groups')}
        {this.renderRadioButton('Leafs', 'Select All Leaves')}
        {this.renderRadioButton('Rectos', 'Select All Rectos')}
        {this.renderRadioButton('Versos', 'Select All Versos')}
      </RadioButtonGroup>
    );

    const exportDialog = (
      <Export
        projectID={this.props.project.id}
        label={this.state.export.label}
        exportOpen={this.state.export.open}
        handleExportToggle={this.handleExportToggle}
        exportedData={this.props.exportedData}
        exportedImages={this.props.exportedImages}
        exportedType={this.state.export.type}
        projectTitle={this.props.project.title}
        showCopyToClipboardNotification={this.showCopyToClipboardNotification}
        downloadImage={() => {
          this.combineDiagram();
          this.handleDownloadCollationDiagram();
        }}
        numRootGroups={this.numRootGroups()}
        setExport={this.setExport}
        exportCols={this.state.export.exportCols}
        exportNotes={this.state.export.exportNotes}
      />
    );

    let sidebarClasses = 'sidebar';
    if (!this.state.leftSideBarOpen) sidebarClasses += ' hidden';
    if (this.props.popUpActive) sidebarClasses += ' lowerZIndex';

    const sidebar = (
      <div role="region" aria-label="sidebar" className={sidebarClasses}>
        <hr />
        {tipsDiv}
        {this.props.collationManager.viewMode !== 'VIEWING' ? (
          <ManagersPanel
            popUpActive={this.props.popUpActive}
            managerMode={this.props.managerMode}
            changeManagerMode={this.props.changeManagerMode}
          />
        ) : (
          ''
        )}
        <Panel
          title="Selector"
          defaultOpen={true}
          tabIndex={this.props.popUpActive ? -1 : 0}
        >
          {selectionRadioGroup}
          <FlatButton
            aria-label="Clear selection"
            label="Clear selection"
            onClick={e =>
              this.setState({ selectAll: '' }, this.handleSelection(''))
            }
            secondary
            fullWidth
            style={this.state.selectAll === '' ? { display: 'none' } : {}}
            tabIndex={this.props.popUpActive ? -1 : 0}
            labelStyle={
              this.state.windowWidth <= 768
                ? { fontSize: '0.75em', padding: 2 }
                : {}
            }
          />
        </Panel>
        <Panel
          title="Share"
          defaultOpen={false}
          tabIndex={this.props.popUpActive ? -1 : 0}
        >
          <div className="export">
            <FlatButton
              label={'GET SHAREABLE URL'}
              aria-label={'Get URL for sharing online'}
              labelStyle={{
                color: '#ffffff',
                fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
              }}
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{ width: '100%' }}
              onClick={() => {
                this.handleExportToggle(
                  true,
                  'share',
                  'Share this project',
                  1,
                  true
                );
              }}
              tabIndex={this.props.popUpActive ? -1 : 0}
            />
          </div>
        </Panel>
        <Panel
          title="Export"
          defaultOpen={false}
          tabIndex={this.props.popUpActive ? -1 : 0}
        >
          <h2>Export Collation Data</h2>
          <div className="export">
            <FlatButton
              label="JSON"
              aria-label="Export to JSON"
              labelStyle={
                this.props.project.leafIDs.length === 0
                  ? {
                      color: '#a5a5a5',
                      cursor: 'not-allowed',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
                  : {
                      color: '#ffffff',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
              }
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{ width: '100%' }}
              onClick={() => this.handleExportToggle(true, 'json', 'JSON')}
              tabIndex={this.props.popUpActive ? -1 : 0}
              disabled={this.props.project.leafIDs.length === 0}
            />
            <FlatButton
              label="VisColl XML"
              aria-label="Export to VisColl XML"
              labelStyle={
                this.props.project.leafIDs.length === 0
                  ? {
                      color: '#a5a5a5',
                      cursor: 'not-allowed',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
                  : {
                      color: '#ffffff',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
              }
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{ width: '100%' }}
              onClick={() => this.handleExportToggle(true, 'xml', 'XML')}
              tabIndex={this.props.popUpActive ? -1 : 0}
              disabled={this.props.project.leafIDs.length === 0}
            />
          </div>
          <h2>Export Collation Diagram</h2>
          <div className="export">
            <FlatButton
              label={
                this.props.collationManager.viewMode === 'TABULAR'
                  ? 'In Visual mode only'
                  : 'PNG'
              }
              aria-label={
                this.props.collationManager.viewMode === 'TABULAR'
                  ? 'Export to PNG only available in visual and viewing modes'
                  : 'Export to PNG'
              }
              labelStyle={
                this.props.collationManager.viewMode === 'TABULAR' ||
                this.props.project.leafIDs.length === 0
                  ? {
                      color: '#a5a5a5',
                      cursor: 'not-allowed',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
                  : {
                      color: '#ffffff',
                      fontSize: this.state.windowWidth <= 768 ? '0.75em' : null,
                    }
              }
              backgroundColor="rgba(255, 255, 255, 0.05)"
              style={{ width: '100%' }}
              onClick={() => {
                this.handleExportToggle(true, 'png', 'PNG', 1, true);
              }}
              disabled={
                this.props.collationManager.viewMode === 'TABULAR' ||
                this.props.project.leafIDs.length === 0
              }
              tabIndex={this.props.popUpActive ? -1 : 0}
            />
          </div>
        </Panel>
      </div>
    );

    const infobox = (
      <div
        className="infoBox"
        style={{ ...this.state.contentStyle, ...this.state.infoBoxStyle }}
      >
        <InfoBox
          type={this.props.selectedObjects.type}
          user={this.props.user}
          closeNoteDialog={this.closeNoteDialog}
          commonNotes={this.getCommonNotes()}
          openNoteDialog={this.openNoteDialog}
          action={{
            linkNote: this.props.linkNote,
            unlinkNote: this.props.unlinkNote,
            updatePreferences: this.props.updatePreferences,
          }}
          togglePopUp={this.props.togglePopUp}
          tabIndex={this.props.popUpActive ? -1 : 0}
          windowWidth={this.state.windowWidth}
        />
      </div>
    );

    let workspace = <div></div>;
    if (this.props.project.groupIDs.length > 0) {
      if (this.props.collationManager.viewMode === 'TABULAR') {
        workspace = (
          <div role="main">
            <div className="projectWorkspace" style={this.state.contentStyle}>
              <h1>{this.props.project.title}</h1>
              <TabularMode
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                handleObjectPress={this.handleObjectPress}
                popUpActive={this.props.popUpActive}
                tabIndex={this.props.popUpActive ? -1 : 0}
                groupIDs={this.props.groupIDs}
                leafIDs={this.props.leafIDs}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else if (this.props.collationManager.viewMode === 'VISUAL') {
        workspace = (
          <div role="main">
            <div className="projectWorkspace" style={this.state.contentStyle}>
              <h1>{this.props.project.title}</h1>
              <VisualMode
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                tacketed={this.props.collationManager.visualizations.tacketed}
                sewing={this.props.collationManager.visualizations.sewing}
                toggleVisualizationDrawing={
                  this.props.toggleVisualizationDrawing
                }
                updateGroup={this.updateGroup}
                openNoteDialog={note => this.openNoteDialog(note, true)}
                tabIndex={this.props.popUpActive ? -1 : 0}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      } else {
        workspace = (
          <div role="main">
            <div
              className="projectWorkspace"
              style={
                this.state.leftSideBarOpen
                  ? { ...this.state.contentStyle }
                  : { ...this.state.contentStyle, left: 0, width: '73%' }
              }
            >
              <h1>{this.props.project.title}</h1>
              <ViewingMode
                project={this.props.project}
                collationManager={this.props.collationManager}
                handleObjectClick={this.handleObjectClick}
                selectedObjects={this.props.selectedObjects}
                imageViewerEnabled={this.state.imageViewerEnabled}
              />
            </div>
            {infobox}
            {exportDialog}
          </div>
        );
      }
    }
    if (this.props.project.groupIDs.length === 0 && !this.props.loading) {
      workspace = (
        <div role="main">
          <div className="projectWorkspace">
            <h3>
              It looks like you have an empty project. Add a new Group to start
              collating.
            </h3>
          </div>
          {infobox}
        </div>
      );
    }
    if (this.state.export.open && this.state.export.label === 'PNG') {
      workspace = (
        <div role="main">
          <div className="projectWorkspace" style={this.state.contentStyle}>
            <h1>{this.props.project.title}</h1>
            <ExportMode
              project={this.props.project}
              collationManager={this.props.collationManager}
              handleObjectClick={this.handleObjectClick}
              tacketed={this.props.collationManager.visualizations.tacketed}
              sewing={this.props.collationManager.visualizations.sewing}
              toggleVisualizationDrawing={this.props.toggleVisualizationDrawing}
              updateGroup={this.updateGroup}
              openNoteDialog={note => this.openNoteDialog(note, true)}
              tabIndex={this.props.popUpActive ? -1 : 0}
              showNotes={this.state.export.exportNotes}
            />
          </div>
          {infobox}
          {exportDialog}
        </div>
      );
    }
    return (
      <div className="collationManager">
        {topbar}
        {sidebar}
        <Filter
          open={this.props.filterPanelOpen}
          filterHeightChange={this.filterHeightChange}
          fullWidth={
            this.props.collationManager.viewMode === 'VIEWING' &&
            this.state.imageViewerEnabled
          }
          tabIndex={
            this.props.popUpActive || !this.props.filterPanelOpen ? -1 : 0
          }
        />
        {workspace}
        <NoteDialog
          open={this.state.activeNote !== null}
          commonNotes={this.getCommonNotes()}
          activeNote={
            this.state.activeNote ? this.state.activeNote : { id: null }
          }
          closeNoteDialog={this.closeNoteDialog}
          action={{
            updateNote: this.updateNote,
            deleteNote: this.deleteNote,
            linkNote: this.linkDialogNote,
            unlinkNote: this.unlinkDialogNote,
            linkAndUnlinkNotes: this.linkAndUnlinkNotes,
          }}
          projectID={this.props.project.id}
          noteTypes={this.props.project.noteTypes}
          Notes={this.props.project.Notes}
          Groups={this.props.project.Groups}
          groupIDs={this.props.project.groupIDs}
          Leafs={this.props.project.Leafs}
          leafIDs={this.props.project.leafIDs}
          Rectos={this.props.project.Rectos}
          rectoIDs={this.props.project.rectoIDs}
          Versos={this.props.project.Versos}
          versoIDs={this.props.project.versoIDs}
          isReadOnly={this.props.collationManager.viewMode === 'VIEWING'}
          togglePopUp={this.props.togglePopUp}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    user: state.user,
    project: state.active.project,
    preferences: state.active.project.preferences,
    managerMode: state.active.managerMode,
    filterPanelOpen: state.active.collationManager.filters.filterPanelOpen,
    selectedObjects: state.active.collationManager.selectedObjects,
    collationManager: state.active.collationManager,
    loading: state.global.loading,
    exportedData: state.active.exportedData,
    exportedImages: state.active.exportedImages,
    groupIDs: state.active.project.groupIDs,
    leafIDs: state.active.project.leafIDs,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    loadProject: (projectID, props) => {
      dispatch(loadProject(projectID));
    },

    changeViewMode: viewMode => {
      dispatch(changeViewMode(viewMode));
    },

    handleObjectPress: (selectedObjects, object, event) => {
      dispatch(handleObjectPress(selectedObjects, object, event));
    },

    handleObjectClick: (
      selectedObjects,
      object,
      event,
      Groups,
      Leafs,
      Rectos,
      Versos
    ) => {
      dispatch(
        handleObjectClick(selectedObjects, object, event, {
          Groups,
          Leafs,
          Rectos,
          Versos,
        })
      );
    },

    changeManagerMode: managerMode => {
      dispatch(changeManagerMode(managerMode));
    },

    toggleFilterPanel: value => {
      dispatch(toggleFilterPanel(value));
    },

    updateProject: (project, projectID) => {
      dispatch(updateProject(projectID, project));
    },

    hideProjectTip: () => {
      dispatch({ type: 'HIDE_PROJECT_TIP' });
    },

    updateGroup: (groupID, group, props) => {
      dispatch(updateGroup(groupID, group));
    },

    updateNote: (noteID, note, projectID, filters) => {
      dispatch(updateNote(noteID, note)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    deleteNote: (noteID, projectID, filters) => {
      dispatch(deleteNote(noteID)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    linkNote: (noteID, object, projectID, filters) => {
      dispatch(linkNote(noteID, object)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    unlinkNote: (noteID, object, projectID, filters) => {
      dispatch(unlinkNote(noteID, object)).then(() =>
        dispatch(reapplyFilterProject(projectID, filters))
      );
    },

    linkAndUnlinkNotes: (
      noteID,
      linkObjects,
      unlinkObjects,
      projectID,
      filters
    ) => {
      if (linkObjects.length > 0 && unlinkObjects.length > 0) {
        dispatch(linkNote(noteID, linkObjects))
          .then(action => dispatch(unlinkNote(noteID, unlinkObjects)))
          .then(() => dispatch(reapplyFilterProject(projectID, filters)));
      } else if (linkObjects.length > 0) {
        dispatch(linkNote(noteID, linkObjects)).then(() =>
          dispatch(reapplyFilterProject(projectID, filters))
        );
      } else if (unlinkObjects.length > 0) {
        dispatch(unlinkNote(noteID, unlinkObjects)).then(() =>
          dispatch(reapplyFilterProject(projectID, filters))
        );
      }
    },
    toggleVisualizationDrawing: data => {
      dispatch(toggleVisualizationDrawing(data));
    },

    updateFilterSelection: (
      selection,
      GroupIDs,
      LeafIDs,
      RectoIDs,
      VersoIDs
    ) => {
      dispatch(
        updateFilterSelection(selection, [], {
          GroupIDs,
          LeafIDs,
          RectoIDs,
          VersoIDs,
        })
      );
    },

    exportProject: (projectID, format) => {
      dispatch(exportProject(projectID, format));
    },

    showCopyToClipboardNotification: () => {
      dispatch({
        type: 'SHOW_NOTIFICATION',
        payload: 'Successfully copied to clipboard',
      });
      setTimeout(() => dispatch({ type: 'HIDE_NOTIFICATION' }), 4000);
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CollationManager);
