import React from 'react';
import AddIcon from 'material-ui/svg-icons/content/add';
import CopyIcon from 'material-ui/svg-icons/content/content-copy';

/** New Project dialog - select between creating new, importing and cloning project  */
const NewProjectSelection = (props) => {
  return (
    <div role="menu" style={{width:"100%", margin:"auto"}} className="newProjectSelection">
      <button 
        type="button" 
        name="Create new" 
        aria-labelledby="createTitle" 
        aria-describedby="createDescription" 
        className="btnSelection"
        onClick={() => props.setProjectType("new")}
        tabIndex="1"
      >
        <div className="selectItem">
          <div className="icon" aria-hidden="true">
            <AddIcon />
          </div>
          <div className="text">
            <span id="createTitle">Create new</span>
            <span id="createDescription">Create a new collation from scratch</span>
          </div>
        </div>
      </button>

      {/*disabled XML upload functionality*/}
      {/*<button */}
      {/*  type="button" */}
      {/*  name="Import" */}
      {/*  aria-labelledby="importTitle" */}
      {/*  aria-describedby="importDescription" */}
      {/*  className="btnSelection"*/}
      {/*  onClick={() => props.setProjectType("import")}*/}
      {/*  tabIndex="2"*/}
      {/*>*/}
      {/*  <div className="selectItem">*/}
      {/*    <div className="icon" aria-hidden="true">*/}
      {/*      <ImportIcon />*/}
      {/*    </div>*/}
      {/*    <div className="text">*/}
      {/*      <span id="importTitle">Import</span>*/}
      {/*      <span id="importDescription">Import a collation from VisColl XML or JSON</span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</button>*/}

      <button 
        type="button" 
        name="Clone" 
        aria-labelledby="cloneTitle" 
        aria-describedby="cloneDescription" 
        className="btnSelection"
        onClick={() => props.setProjectType("clone")}
        tabIndex="3"
      >
        <div className="selectItem">
          <div className="icon" aria-hidden="true">
            <CopyIcon />
          </div>
          <div className="text">
            <span id="cloneTitle">Clone</span>
            <span id="cloneDescription">Clone one of your existing collations</span>
          </div>
        </div>
      </button>
    </div>
  );
}
export default NewProjectSelection;