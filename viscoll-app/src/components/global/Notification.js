import React from 'react';
import Snackbar from 'material-ui/Snackbar';

/** Stateless functional component for snackbar notification */
const Notification = (props) => {
    return (
      <Snackbar
        open={props.message ? true : false}
        message={props.message}
        autoHideDuration={4000}
        bodyStyle={props.message.includes("oops")? {background: '#CE5656'} : {background: '#34A251'}}
      />
    );
}
export default Notification;
