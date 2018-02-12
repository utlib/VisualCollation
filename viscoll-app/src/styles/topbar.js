let topbarStyle = () => {
  let width = 200;
  if (window.innerWidth<=870) {
    width = 120;
  } else if (window.innerWidth<=1024) {
    width = 150;
  }
  return {
    tab: {
      width, 
      height: 55, 
      color: '#6A6A6A',
      fontSize: window.innerWidth<=870?"12px":null,
    },
  }
}
export default topbarStyle;