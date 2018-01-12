export let btnLg = {
  buttonStyle: {
    height: 60,
  },
  labelStyle: {
    fontSize: window.innerWidth<=768?18:20,
  },
  overlayStyle: {
    paddingTop: 12,
    height: 48,
  }
}


export let btnMd = {
  buttonStyle: {
    height: 50,
  },
  labelStyle: {
    fontSize: window.innerWidth<=768?16:18,
  },
  overlayStyle: {
    paddingTop: 8,
    height: 42,
  }
}

export let btnAuthCancel = {
  labelStyle: {
    color: "#a5bde0",
  }
}


export let btnBase = () =>  { 
  let fontSize = "0.9em";
  if (window.innerWidth<=1024) {
    fontSize = "0.8em";
  } 
  if (window.innerWidth<=768) {
    fontSize = "0.7em";
  } 
  return {
    labelStyle:{
      fontSize, 
    },
    buttonStyle: {
      lineHeight: window.innerWidth<=768?"32px":"36px",
    },
    style: {
      minWidth: window.innerWidth<=1024?"30px":"78px", 
    },
  }
}

export let radioBtnDark = () => {
  return {
    labelStyle: {
      color:"#ffffff",
      fontSize:window.innerWidth<=768?"0.6em":"0.9em", 
      width:window.innerWidth<=768?"inherit":"",
      lineHeight: window.innerWidth<=768?"inherit":null,
      paddingTop:window.innerWidth<=768?5:null,
    },
    iconStyle: {
      fill:"#4ED6CB", 
      marginRight:window.innerWidth<=768?"10px":"12px",
    }
  }
}