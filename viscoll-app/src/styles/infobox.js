let fontSize = null;
if (window.innerWidth<=768) {
  fontSize = "12px";
} else if (window.innerWidth<=1024) {
  fontSize = "14px";
}

let infoBoxStyle = {
  tab: {
    color: '#6A6A6A',
    fontSize,
  },
}
export default infoBoxStyle;