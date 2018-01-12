export let checkboxStyle = () => { 
  let fontSize = null;
  if (window.innerWidth<=1024) {
    fontSize = "14px";
  } 
  if (window.innerWidth<=768) {
    fontSize = "12px";
  } 
  return {
    iconStyle:{
      height:window.innerWidth<=1024?15:20,
      width:window.innerWidth<=1024?15:20,
      marginTop:window.innerWidth<=1024?"2px":null,
      marginRight:window.innerWidth<=1024?"5px":"10px",
    },
    labelStyle: {
      fontSize,
      lineHeight:"21px",
    }
  }
}