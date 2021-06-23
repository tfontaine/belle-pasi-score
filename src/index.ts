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
  protected _selectedFile: Blob = null;
 
  /**
   * Link to uploader image.
   */
  @property({ attribute: 'uploader-background', type: String})
  uploaderBackground = "http://localhost:8080/belle-pasi-score-uploader.jpg";

  /**
   * Initial height.
   */
  @property({ attribute: 'height', type: Number })
  widgetHeight = 833;

  /**
   * Initial width.
   */
  @property({ attribute: 'width', type: Number })
  widgetWidth = 374;

  /**
   * _isDragover accessors
   */
  set isDragover(value) {
    this._isDragover = value;
  }
  
  get isDragover() {
    return this._isDragover;
  }

  /**
   * _selectedFile accessors
   */
  set selectedFile(file) {
    this._selectedFile = file;
  } 

  get selectedFile() {
    return this._selectedFile;
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

    .panel {
        position: relative;
        display: inline-block;
    }

    .uploader {
      position: absolute;
      z-index: 999;
      top: 38%;
      left: 4%;
      font-size: 1rem;
      color: #666666;
      cursor: pointer;
      width: 340px;
      height: 173px;
      background: transparent;
      border: none;
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
        ${this.renderBackgroundImage()}
        ${this.renderUploader()}
      </div>
    `;
  }

  /**
   * Rendering
   */
  protected renderBackgroundImage() {
    return html`<img src=${this.uploaderBackground} height="${this.widgetHeight}px" width="${this.widgetWidth}px" />`;
  }

  protected renderUploader() {
    return html`<input id="image-uploader" class="hidden" type="file" accept="*" @change=${this._imageDrop} />
        <label for="image-uploader" id="image-dragover" class=${this.isDragover ? "uploader dragover" : "uploader"}
            @dragover=${this._imageDragOver} @dragleave=${this._imageDragOver} @drop=${this._imageDrop}>
          <img id="preview" class="hidden" />
        </label>`;
  }

  /**
   * Drag and drop logic
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
    if (!fileList || fileList.length == 0) {
      fileList = event.dataTransfer.files;
    }

    // Select and Show the first file available from the list
    if (fileList && fileList.length > 0) {
      for (let idx = 0, file; (file = fileList[idx]); idx++) {
        if (file && file.name.length > 0 && file.size > 0) {
          this.selectedFile = file;
          break;
        }
      }
    }

    // Exploit dropped file: show and analyse
    if (this.selectedFile) {
      let fileContent = new FileReader();

      fileContent.readAsDataURL(this.selectedFile);
      fileContent.onloadend = () => {
        // Show selected file
        this.showSelectedFile(fileContent.result);

        // Run the analysis
        this.runAnalysis(fileContent.result);
      };
    }
  } 
 
  protected showSelectedFile(selectedPayload) {
    let preview = <HTMLImageElement>this.shadowRoot.getElementById("preview");
    if (preview) {
      preview.src = selectedPayload.toString();
      preview.classList.remove("hidden");
    }
  }

  protected async runAnalysis(selectedPayload) {
    try {
      const response = await fetch("https://diseases.skinai.net/predict_torus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(selectedPayload)
        });

      if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        console.log(message);

        window.alert("Oops! Something went wrong.");
      }
    
      const analysisResults = await response.json();
      this.showResults(analysisResults);
    } catch(error) {
      console.log("An error occured", error.message);
      window.alert("Oops! Something went wrong.");
    }
  }

  protected showResults(resultPayload) {
  }
}
