import React from 'react';
import OpenSeadragon from 'openseadragon';
import UUID from 'uuid';
import BlankPage from '../../assets/blank_page.png';

/** iamge viewing component (OpenSeaDragon) */
export default class ImageViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      suffixedID: 'openseadragon-' + UUID.v4(),
      osd: null
    }
  }

  componentDidMount() {
    var tilesSources = [];
    if (this.props.rectoURL) tilesSources.push(this.props.rectoURL + "/info.json");
    if (this.props.versoURL) tilesSources.push(this.props.versoURL + "/info.json");
    if (!this.props.rectoURL && !this.props.versoURL) tilesSources = [{type: "image", url: BlankPage}];
    this.setState({
      osd: OpenSeadragon({
        id: this.state.suffixedID,
        prefixUrl: 'https://cdnjs.cloudflare.com/ajax/libs/openseadragon/2.3.1/images/',
        showNavigationControl: true,
        showFullPageControl: false,
        showRotationControl: true,
        showNavigator: true,
        collectionMode: true,
        collectionRows: 1,
        collectionTileMargin: 1,
        crossOriginPolicy: 'Anonymous',
        navImages: {
          zoomIn: {
            REST: "zoomin_rest.png",
            GROUP: "zoomin_grouphover.png",
            HOVER: "zoomin_hover.png",
            DOWN: "zoomin_pressed.png"
          },
          zoomOut: {
            REST: "zoomout_rest.png",
            GROUP: "zoomout_grouphover.png",
            HOVER: "zoomout_hover.png",
            DOWN: "zoomout_pressed.png"
          },
          home: {
            REST: "home_rest.png",
            GROUP: "home_grouphover.png",
            HOVER: "home_hover.png",
            DOWN: "home_pressed.png"
          },
          rotateleft: {
            REST: "rotateleft_rest.png",
            GROUP: "rotateleft_grouphover.png",
            HOVER: "rotateleft_hover.png",
            DOWN: "rotateleft_pressed.png"
          },
          rotateright: {
            REST: "rotateright_rest.png",
            GROUP: "rotateright_grouphover.png",
            HOVER: "rotateright_hover.png",
            DOWN: "rotateright_pressed.png"
          }
        },
        tileSources: tilesSources
      })
    });
  }

  componentWillUpdate(nextProps) {
    this.addTiles(nextProps.rectoURL, nextProps.versoURL);
  }

  addTiles(r, v) {
    if (this.state.osd) {
      var tilesSources = [];
      if (r) tilesSources.push(r + "/info.json");
      if (v) tilesSources.push(v + "/info.json");
      if (!r && !v) tilesSources = [{type: "image", url: BlankPage}];
      this.state.osd.open(tilesSources);
    }
  }

  render() {
    let style = {width: "100%", height: "500px", background: "black"};
    if (this.props.fixed) style = {position: "fixed", width:"42.5%",height:"82%", left: "30%", background: 'black', padding: 5};
    return (
      <div id={this.state.suffixedID} className="openseadragon" style={style}>
      </div>
    );
  }
}
