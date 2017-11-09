import light from "./light.js";

let sidebarStyle = {
  panel: {
    main: {
      background: light.palette.primary2Color,
      boxShadow: "none",
      
    },
    title: {
      textTransform: "uppercase",
      fontSize: "1.1em"
    },
    text: {
      background: "rgba(82, 108, 145, 0.2)",
      overflowY: "auto",
      maxHeight: "40vh",

    }
  },
}
export default sidebarStyle;