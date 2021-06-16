import {html, css, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';

@customElement('belle-pasi-score')
export class BellePasiScore extends LitElement {
  /**
   * Internal dragover state.
   */
  @state()
  protected _isDragover: boolean = false;

  /**
   * Selected file for analysis.
   */
  @state()
  protected _selectedFilename: String = "";

  /**
   * Initial caption.
   */
  @property({ attribute: 'uploader-caption', type: String })
  uploaderCaption = "Drop image here or click to select";

  set isDragover(value) {
    this._isDragover = value;
  } 

  /**
   * Accessors
   */
  get isDragover() {
    return this._isDragover;
  }

  set selectedFileName(fileName) {
    this._selectedFilename = fileName;
  } 

  get selectedFilename() {
    return this._selectedFilename;
  }

  /**
   * CSS - HTML - Template
   */
  static styles = css`
    .hidden {
      display: none;
    }

    .reveal {
      opacity: 0;
    }

    .reveal:hover {
      opacity: 0.3;
    }

    .uploader {
      font-size: 1rem;
      color: #666666;
      cursor: pointer;
      width: 25rem;
      height: 15rem;
      background: #fff;
      border: 0.1rem dashed #838388;
      border-radius: 0.4rem;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      margin: 1rem 0 2rem 0;
    }

    .uploader.dragover {
      color: #eeeeee;
      border: 0.1rem solid rgb(0, 120, 212);
      box-shadow: inset 0 0 0 0.1rem rgb(0, 120, 212);
    }

    .uploader:hover {
      border-color: rgb(0, 120, 212);
    }

    .uploader #preview {
      max-width: 15rem;
      max-height: 15rem;
      box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19);
    }
  }`

  render() {
    return html`
      <div class="panel">
        <input id="image-uploader" class="hidden" type="file" accept="*" @change=${this._imageDrop} />
  	    <label for="image-uploader" id="image-dragover" class=${this.isDragover ? "uploader dragover" : "uploader"}
          @dragover=${this._imageDragOver} @dragleave=${this._imageDragOver} @drop=${this._imageDrop}>
    	    <div id="upload-caption">${this.uploaderCaption}</div>
    	      <img id="preview" class="hidden" />
    	      <img id="url-preview" class="hidden" />
        </label>
      </div>
    `;
  }

  /**
   * Methods
   */
  protected _imageDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.type.toLowerCase() === "dragover") {
      this.isDragover = true;
    } else {
      this.isDragover = false;
    }
  }

  protected _imageDrop(event) {
    this._imageDragOver(event);

    // Catch the most probable file list
    let fileList = event.target.files;
    if (!fileList || fileList.length() == 0) {
      fileList = event.dataTransfer.files;
    }

    // Select and Show the first file available from the list
    if (fileList && fileList.length > 0) {
      for (let idx = 0, fileName; (fileName = fileList[idx]); idx++) {
        if (fileName && fileName.length > 0) {
          this.selectedFileName = fileName;
          break;
        }
      }
    }

    // Show selected file
    //this.showSelectedFile();
  }
}
