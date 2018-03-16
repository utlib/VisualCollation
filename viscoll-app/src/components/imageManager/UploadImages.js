import React, {Component} from 'react';
import update from 'immutability-helper';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import { btnBase } from '../../styles/button';

/** Upload image component */
class UploadImages extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedImages: [],
      uploadedDuplicates: [],
      duplicatesToUpload: [],
      filesizeExceeded: [],
    };
  }

  /**
   * Removes file extension and replaces any "." with underscore
   */
  parseFilename = (filename) => {
    let tokenizedName = filename.split(/[\s.-]+/);
    tokenizedName.splice(-1);
    tokenizedName = tokenizedName.join("_");
    return tokenizedName.toLowerCase();
  }

  submitUpload = (e) => {
    e.preventDefault();
    const duplicateImageUploads = this.state.uploadedDuplicates.filter((item,i)=>this.state.duplicatesToUpload[i]);
    const uploadedImages = this.state.uploadedImages.concat(duplicateImageUploads);
    this.props.action.uploadImages(uploadedImages);
    // Clear input file list
    this.setState({uploadedImages:[], filesizeExceeded: [], duplicatesToUpload:[], uploadedDuplicates:[]});
    document.getElementById("uploadImages").value="";
  }

  resetUpload = (e) => {
    e.preventDefault();
    this.setState({uploadedImages:[], filesizeExceeded:[], duplicatesToUpload:[], uploadedDuplicates:[]});
    document.getElementById("uploadImages").value="";
  }

  handleFiles = (files) => {
    let findIfExists = function(img) {
      return img.label===this.filename+"."+this.fileExtension;
    }
    let that = this;
    let onLoadEnd = function(filename, targetState) {
      return function (event) {
        const newImageList = update(that.state[targetState], {$push:[{filename, content:this.result}]});
        that.setState({[targetState]: newImageList});
      }
    }
    this.setState({uploadedImages: []}, ()=>{
    let duplicatesToUpload = [];
    let filesizeExceeded = [];
      for (let i=0; i<files.length; i++) {
        const file = files[i];
        const filename = this.parseFilename(files[i].name);
        const fileExtension = file.type.split(/[\s/-]+/).splice(-1);
        if (file.size>15728640) {
          // Filesize is greater than 15mb, do not upload
          filesizeExceeded.push(filename);
        } else {
          const reader = new FileReader();
          // Read file content
          reader.readAsDataURL(file);
          if (this.props.images.findIndex(findIfExists, {filename, fileExtension})>=0) {
            // Filename already exists, read file and store in 'uploadedDuplicates' state
            duplicatesToUpload.push(true);
            reader.onloadend = onLoadEnd(filename,"uploadedDuplicates");
          } else {
            // Filename doesn't exist, read file and store in 'uploadedImages' state
            reader.onloadend = onLoadEnd(filename, "uploadedImages");
          }
        }
      }
      if (duplicatesToUpload.length>0) {
        this.setState({duplicatesToUpload});
      }
      if (filesizeExceeded.length>0) {
        this.setState({filesizeExceeded});
      }
    })
  }

  toggleCheckbox = (index) => {
    let duplicatesToUpload = [...this.state.duplicatesToUpload];
    duplicatesToUpload[index] = !duplicatesToUpload[index];
    this.setState({duplicatesToUpload});
  }

  render() {
    // Generate file duplicate error message content if neccessary
    let duplicateErrorSection = null;
    let filesizeErrorSection = null;
    let errorText = "";
    if (this.state.duplicatesToUpload.length>0) {
      duplicateErrorSection = <div style={{wordWrap: "break-word"}}>
        <div style={{background:"#fadcdc",padding:"0.5em"}}>
          <p style={{color:"#bd4a4a"}}>The following file{this.state.duplicatesToUpload.length>1?"s ":" "} 
            already exist{this.state.duplicatesToUpload.length>1?"":"s"}.  If you choose to upload 
            {this.state.duplicatesToUpload.length>1?" them":" it"}, {this.state.duplicatesToUpload.length>1?"they ":"it "} 
            will get renamed. </p>
            {
              this.state.uploadedDuplicates.map((file,i)=>
                <Checkbox 
                  key={"checkbox"+i}
                  aria-label={"Upload " + file.filename}
                  label={file.filename.length>30?file.filename.substring(0,30)+"...": file.filename} 
                  labelStyle={{color:"#bd4a4a"}}
                  checked={this.state.duplicatesToUpload[i]}
                  onClick={()=>this.toggleCheckbox(i)}
                />
              )
            }
        </div>
      </div>
    }
    if (this.state.filesizeExceeded.length>0) {
      filesizeErrorSection = <div style={this.state.duplicateErrorSection.length>0?{wordWrap: "break-word",marginTop:5}:{wordWrap: "break-word"}}>
      <div style={{background:"#fadcdc",padding:"0.5em"}}>
        <p style={{color:"#bd4a4a"}}>The following file{this.state.filesizeExceeded.length>1?"s are":" is"} greater than 15mb and will not be uploaded:</p>
        <ul style={{color:"#bd4a4a"}}>
          {this.state.filesizeExceeded.map((filename)=><li key={filename}>{filename}</li>)}
        </ul>
      </div>
    </div>
    }

    if ((duplicateErrorSection || filesizeErrorSection) && this.state.uploadedImages.length>0) {
      errorText = <div>There {this.state.uploadedImages.length>1?"are":"is"} {this.state.uploadedImages.length} other file{this.state.uploadedImages.length>1?"s":""} ready for upload.</div>;
    }

    return <div>
      <div style={{background:"white",padding:"1em 0em 0em 0em"}}>
        <input 
          id="uploadImages"
          type="file" 
          accept=".png, .jpg, .jpeg, .gif, .tiff"
          name="uploadImages" 
          aria-label="Upload images" 
          onChange={(event)=>this.handleFiles(event.target.files)}
          onClick={(event)=>{event.target.value=null; this.setState({uploadedImages:[], filesizeExceeded:[], duplicatesToUpload:[], uploadedDuplicates:[]})}}
          multiple
          style={{width:"100%"}}
        />
        <p style={{fontSize:"0.8em", color:"#4e4e4e", paddingLeft:5}}>
          Accepted formats: <b>.png, .jpeg, .jpg, .gif, .tiff</b>
        </p>
      </div>
      {duplicateErrorSection}
      {filesizeErrorSection}
      {errorText}
      <div style={{textAlign:"right",paddingTop:10}}>
        <RaisedButton
          disabled={this.state.uploadedImages.length===0&&this.state.uploadedDuplicates.length===0&&this.state.filesizeExceeded.length===0}
          label="Reset"
          name="reset"
          onClick={(e)=>this.resetUpload(e)}
          tabIndex={this.props.tabIndex}
          {...btnBase()}
          style={{...btnBase().style, marginRight: 5}}
        />
        <RaisedButton 
          label="Upload"
          disabled={this.state.uploadedImages.length===0&&(this.state.duplicatesToUpload.length===0||this.state.duplicatesToUpload.findIndex((x)=>x)<0)}
          onClick={this.submitUpload}
          primary
          {...btnBase()}
        />
      </div>
    </div>
  }
}
export default UploadImages;