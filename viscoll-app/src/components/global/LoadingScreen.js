import React from 'react';
import Dialog from 'material-ui/Dialog';
import loadingImg from '../../assets/viscoll_loading.gif';

/** Stateless functional component for the loading screen */
const LoadingScreen = (props) => {
  const logo = <img src={loadingImg} alt="logo" style={{padding: 0}} /> ;
  return (
    <Dialog
      open={props.loading}
      contentStyle={{width: 250, padding: 0, zIndex: 2500}}
      bodyStyle={{padding: 0, zIndex: 2500}}
      paperProps={{style:{borderRadius:"100%"}}}
      style={{zIndex: 2500}}
    >
      {logo}
    </Dialog>
  );
}
export default LoadingScreen;
