import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpEventType, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-uploadblob',
  templateUrl: './uploadblob.component.html',
  styleUrls: ['./uploadblob.component.css']
})
export class UploadblobComponent implements OnInit {

  public progress: number;
  public message: string;
  public imageurl: string;
  public name: string;
  public inputValue = '';
  public response: {'imageUri': ''}; 
  public showImage = false;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }

  public uploadFileAzure = (files) => {
    if (files.length === 0) {
      return;
    }
    this.showImage = false;
    let fileToUpload = <File>files[0];
    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);

    this.http.post('https://localhost:5001/api/Upload/UploadAzure', formData, {reportProgress: true, observe: 'events'})
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress)
          this.progress = Math.round(100 * event.loaded / event.total);
        else if (event.type === HttpEventType.Response) {
          this.imageurl = JSON.parse(JSON.stringify(event.body)).imageUri;
          this.name = JSON.parse(JSON.stringify(event.body)).person.name;
          localStorage["imageurl"] = this.imageurl;
          this.message = 'Upload success & Email sent';
          console.log(this.imageurl);
          this.showImage = true;
          console.log('show image:' + this.showImage);
        
        }
      });
  }
  
}
