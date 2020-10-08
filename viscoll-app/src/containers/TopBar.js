import React, {Component} from 'react';
import Toolbar from 'material-ui/Toolbar';
import {ToolbarGroup} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import Avatar from 'material-ui/Avatar';
import UserProfileForm from '../components/topbar/UserProfileForm';
import FlatButton from 'material-ui/FlatButton';
import NotesFilter from "../components/notesManager/NotesFilter";
import FilterIcon from 'material-ui/svg-icons/content/filter-list';
import Undo from 'material-ui/svg-icons/content/undo';
import Redo from 'material-ui/svg-icons/content/redo';
import Image from 'material-ui/svg-icons/image/image';
import imgLogo from '../assets/logo_white.svg';
import {btnBase} from "../styles/button";
import { connect } from "react-redux";
import { 
  logout,
  updateProfile,
  deleteProfile
} from "../actions/backend/userActions";

/** The topbar menu used in `Dashboard` and `Project` components */
class TopBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userProfileModalOpen: false
    };
  }

  componentDidMount() {
    window.addEventListener("keydown", this.shortcutListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.shortcutListener);
  }

  shortcutListener = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.code==="KeyZ") {
      if (this.props.actionHistory.undo.length>0) this.props.undo();
    } else if ((event.ctrlKey || event.metaKey) && event.code==="KeyY") {
      event.preventDefault();
      if (this.props.actionHistory.redo.length>0) this.props.redo();
    }
  }

  handleUserProfileUpdate = (user) => {
    const userID = this.props.user.id;
    this.props.updateProfile(user, userID);
  }

  toggleUserProfile = (userProfileModalOpen=false) => {
    this.setState({ userProfileModalOpen });
    this.props.togglePopUp(userProfileModalOpen);
  }

  handleUserAccountDelete = () => {
    const userID = this.props.user.id;
    this.props.deleteProfile(userID);
  }

  handleUserLogout = () => {
    this.props.logoutUser();
  }

  goHome = () => {
    if (this.props.history.location.pathname.includes("dashboard")) {
      this.props.goToDashboardProjectList();
    } else {
      this.props.resetActionHistory();
      this.props.history.push('/dashboard');
    }
  }

  render() {
    // User icon menu on the right corner of Toolbar
    let UserMenu;
    if (this.props.user.name) {
      UserMenu = ( 
        <IconMenu
          iconButtonElement={ 
            <IconButton 
              tabIndex={this.props.tabIndex}
              style={{padding:0}}
              aria-label="User icon"
            >
              <Avatar color="#3A4B55" backgroundColor="#dfdfdf">{this.props.user.name.charAt(0).toUpperCase()}</Avatar>
            </IconButton> }
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
        >
          <MenuItem primaryText="Edit Profile" 
            onClick={() => this.toggleUserProfile(true)}
          />
          <MenuItem primaryText="Sign out" 
            onClick={() => this.handleUserLogout()}
          />
        </IconMenu>
      );
    }

    let topbarClasses = "topbar";
    if (this.props.popUpActive) topbarClasses += " lowerZIndex"
    let imageViewerTitle="";
    if (this.props.windowWidth>768 && this.props.imageViewerEnabled) {
      imageViewerTitle = "Hide image viewer";
    } else if (this.props.windowWidth>768) {
      imageViewerTitle = "Image viewer";
    }
    return (
      <div role="region" aria-label="toolbar" className={topbarClasses} style={this.props.viewMode==="VIEWING"?{left:0, width:"100%"}:{}}>
        <button 
          className="logo" 
          style={{cursor:"pointer", border:0}} 
          onClick={this.goHome} 
          aria-label="Click to go home" 
          tabIndex={this.props.tabIndex}
        >
          <img src={imgLogo} alt="Viscodex logo" />
        </button>
        <Toolbar style={{background:"#ffffff"}}>
          <ToolbarGroup>
              {this.props.children}
          </ToolbarGroup>
          <ToolbarGroup>
            {this.props.showUndoRedo?
              <div>
                <IconButton 
                  tooltip={this.props.actionHistory.undo.length===0? "" : "Undo (Ctrl Z)"}
                  aria-label="Undo action"
                  tabIndex={this.props.tabIndex}
                  disabled={this.props.actionHistory.undo.length===0}
                  onClick={(e)=>{e.preventDefault();this.props.undo()}}
                >
                  <Undo color={"#526C91"} />
                </IconButton>
                <IconButton 
                  tooltip={this.props.actionHistory.redo.length===0? "" : "Redo (Ctrl Y)"}
                  aria-label="Redo action"
                  tabIndex={this.props.tabIndex}
                  disabled={this.props.actionHistory.redo.length===0}
                  onClick={(e)=>{e.preventDefault();this.props.redo()}}
                >
                  <Redo color={"#526C91"} />
                </IconButton>
              </div>
              : null 
            }

            {this.props.showImageViewerButton ? 
              <FlatButton
                primary
                label={imageViewerTitle}
                onClick={() => this.props.toggleImageViewer()}
                icon={<Image style={{height:20}}/>}
                labelStyle={{...btnBase().labelStyle, padding:this.props.windowWidth<=1024?"0px 10px 0px 0px":10}}
                style={{...btnBase().style, marginRight: 5, }}
                tabIndex={this.props.tabIndex}
              />
              : null
            }
            {this.props.toggleFilterDrawer? 
              <div style={{borderRight:"1px solid #ffffff", paddingRight:"10px"}}>
                <IconButton 
                  tooltip="Filter"
                  onClick={(e)=>{e.preventDefault();this.props.toggleFilterDrawer()}}
                  tabIndex={this.props.tabIndex}
                >
                  <FilterIcon color={"#526C91"}/>
                </IconButton>
              </div>
              : null
            }
            {this.props.notesFilter ? <NotesFilter 
                                        notes={this.props.notes} 
                                        filterNotes={this.props.filterNotes}
                                        onValueChange={this.props.onValueChange}
                                        onTypeChange={this.props.onTypeChange}
                                        filterTypes={this.props.filterTypes}
                                        tabIndex={this.props.tabIndex}
                                    /> : null}
            
            {UserMenu}
          </ToolbarGroup> 
        </Toolbar>
        <UserProfileForm 
          userProfileModalOpen={this.state.userProfileModalOpen}
          handleUserProfileUpdate={this.handleUserProfileUpdate} 
          name={this.props.user.name}
          email={this.props.user.email}
          currentPasswordError={this.props.user.errors.update.current_password}
          emailTakenError={this.props.user.errors.update.email}
          toggleUserProfile={this.toggleUserProfile}
          handleUserAccountDelete={this.handleUserAccountDelete}
        />
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    notes: state.active.notes,
    actionHistory: state.history,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: () => {
      dispatch(logout());
    },
    updateProfile: (user, userID) => {
      dispatch(updateProfile(user, userID));
    },
    deleteProfile: (userID) => {
      dispatch(deleteProfile(userID));
    },
    undo: () => {
      dispatch({type:"UNDO"})
    },
    redo: () => {
      dispatch({type:"REDO"})
    },
    resetActionHistory: () => {
      dispatch({type:"CLEAR_ACTION_HISTORY"})
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

  
