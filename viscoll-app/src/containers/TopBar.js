import React, {Component} from 'react';
import PropTypes from 'prop-types';
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
import Image from 'material-ui/svg-icons/image/image';
import imgLogo from '../assets/logo_white.svg';

import { connect } from "react-redux";
import { 
  logout,
  updateProfile,
  deleteProfile
} from "../actions/userActions";

/** The topbar menu used in `Dashboard` and `Project` components */
class TopBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userProfileModalOpen: false
    };
  }

  /**
   * Pass the user object to the `updateProfile` action
   * @param {object} user 
   * @public
   */
  handleUserProfileUpdate = (user) => {
    const userID = this.props.user.id;
    this.props.updateProfile(user, userID);
  }

  /**
   * Toggle user profile modal
   * @param {boolean} userProfileModalOpen 
   * @public
   */
  toggleUserProfile = (userProfileModalOpen=false) => {
    this.setState({ userProfileModalOpen });
    this.props.togglePopUp(userProfileModalOpen);
  }

  /**
   * Delete user account
   * @public
   */
  handleUserAccountDelete = () => {
    const userID = this.props.user.id;
    this.props.deleteProfile(userID);
  }

  /**
   * Log out user
   * @public
   */
  handleUserLogout = () => {
    this.props.logoutUser();
  }

  /**
   * Redirect to dashboard
   * @public
   */
  goHome = () => {
    this.props.history.push('/dashboard');
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

    return (
      <div role="region" aria-label="toolbar" className="topbar" style={this.props.viewMode==="VIEWING"?{left:0, width:"100%"}:{}}>
        <button 
          className="logo" 
          style={{cursor:"pointer", border:0}} 
          onClick={this.goHome} 
          aria-label="Click to go home" 
          tabIndex={this.props.tabIndex}
        >
          <img src={imgLogo} alt="Viscoll logo" />
        </button>
        <Toolbar style={{background:"#ffffff"}}>
          <ToolbarGroup>
              {this.props.children}
          </ToolbarGroup>
          <ToolbarGroup>
            {this.props.showImageViewerButton ? 
              <FlatButton
                primary
                label={this.props.imageViewerEnabled? "Hide image viewer" : "Image viewer"}
                onClick={() => this.props.toggleImageViewer()}
                icon={<Image style={{height:20}}/>}
                style={{marginRight: 5}}
                tabIndex={this.props.tabIndex}
              />
              : null
            }
            {this.props.toggleFilterDrawer? 
                <FlatButton 
                  primary={true} 
                  onClick={(e)=>{e.preventDefault();this.props.toggleFilterDrawer()}}
                  label={this.props.filterOpen? "Hide filter" : "Filter"}
                  icon={<FilterIcon style={{height:15}}/>}
                  style={{marginLeft:0}}
                  tabIndex={this.props.tabIndex}
                  />
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
  static propTypes = {
    /** A set of Tabs content to display */
    children: PropTypes.object,
    /** User object from Redux store */
    user: PropTypes.object,
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.user,
    notes: state.active.notes
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

  
