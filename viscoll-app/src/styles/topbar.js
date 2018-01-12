let topbarStyle = () => {
  let width = 200;
  if (window.innerWidth<=768) {
    width = 120;
  } else if (window.innerWidth<=1024) {
    width = 150;
  }
  return {
    tab: {
      width, 
      height: 55, 
      color: '#6A6A6A',
      fontSize: window.innerWidth<=768?"12px":null,
    },
  }
}
export default topbarStyle;