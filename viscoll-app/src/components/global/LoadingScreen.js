import React from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog';
import loadingImg from '../../assets/viscoll_loading.gif';

/** Stateless functional component for the loading screen */
const LoadingScreen = (props) => {
  const logo = <img src={loadingImg} alt="logo" style={{padding: 0}} /> ;
  return (
    <Dialog
      open={props.loading}
      contentStyle={{width: 250, padding: 0}}
      bodyStyle={{padding: 0}}
      paperProps={{style:{borderRadius:"100%"}}}
    >
      {logo}
    </Dialog>
  );
}
LoadingScreen.propTypes = {
  /** `true` if loading screen should be shown */
  loading: PropTypes.bool,
}
export default LoadingScreen;
