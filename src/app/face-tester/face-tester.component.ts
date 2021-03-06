import { Component, OnInit, ViewChild, AfterContentInit } from '@angular/core';
import { FaceApiService } from '../services/face-api-service.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { UploadComponent } from "../upload/upload.component";
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {WebcamImage} from 'ngx-webcam';

@Component({
  selector: 'app-face-tester',
  templateUrl: './face-tester.component.html',
  styleUrls: ['./face-tester.component.css']
})
export class FaceTesterComponent implements OnInit {
  loading = false;
  public detectedFaces: any;
  public identifiedPersons = [];
  public imageUrl: string;
  public multiplier: number;
  public personGroups = [];
  public selectedFace: any;
  public selectedGroupId = '';
  public response: {'imageUrl': ''}; 
  public name: string;
  public showCamera = false;
  public cameraButtonText = 'Open Camera';
  @ViewChild('mainImg') mainImg;
  @ViewChild('UploadComponent') uploadComponent;
  
  // latest snapshot
  public webcamImage: WebcamImage = null;  
  handleImage(webcamImage: WebcamImage) {
    this.webcamImage = webcamImage;
    console.log(this.webcamImage.imageAsBase64);
    this.imageUrl = localStorage["imageurl"] ;
    this.showCamera = false;
  }

  constructor(private faceApi: FaceApiService) { }
  ngAfterContentInit()
  {
    
  }

  ngOnInit() {
    this.loading = true;
    this.faceApi.getPersonGroups().subscribe(data => {
      this.personGroups = data;
      this.loading = false;     
    });
  }

  detect() {
    this.loading = true;
    this.faceApi.detect(this.imageUrl).subscribe(data => {
      this.detectedFaces = data;
      console.log('**detect results', this.detectedFaces);
      this.loading = false;
    });

    return this.detectedFaces;

  }

  faceClicked(face) {
    this.selectedFace = face;
    if (this.selectedFace.identifiedPersonId) {
      let identifiedPerson = _.find(this.identifiedPersons, { 'personId': face.identifiedPersonId });
      this.selectedFace.name = identifiedPerson.name;
    }
  }

  identify() {
    let faceIds = _.map(this.detectedFaces, 'faceId');
    this.loading = true;

    //NOTE: for Production app, max groups of 10
    this.faceApi.identify(this.selectedGroupId, faceIds).subscribe(identifiedFaces => {
      console.log('**identify results', identifiedFaces);
      let obsList = [];

      _.forEach(identifiedFaces, identifiedFace => {
        if (identifiedFace.candidates.length > 0) {
          let detectedFace = _.find(this.detectedFaces, { faceId: identifiedFace.faceId });
          detectedFace.identifiedPerson = true;
          detectedFace.identifiedPersonId = identifiedFace.candidates[0].personId;
          detectedFace.identifiedPersonConfidence = identifiedFace.candidates[0].confidence;
          obsList.push(this.faceApi.getPerson(this.selectedGroupId, identifiedFace.candidates[0].personId));
        }
      });

      // Call getPerson() for each identified face
      forkJoin(obsList).subscribe(results => {
        this.identifiedPersons = results;
        this.loading = false;
      });
    });
  }

  Verify(){
    try {
    
      this.loading = true;
      this.faceApi.detect(this.imageUrl).subscribe(data => {
        this.detectedFaces = data;
        console.log('**detect results', this.detectedFaces);
        this.loading = false;     

      let faceIds = _.map(this.detectedFaces, 'faceId');
      this.loading = true;

    //NOTE: for Production app, max groups of 10
    this.faceApi.identify(this.selectedGroupId, faceIds).subscribe(identifiedFaces => {
      console.log('**identify results', identifiedFaces);
      let obsList = [];

      _.forEach(identifiedFaces, identifiedFace => {
        if (identifiedFace.candidates.length > 0) {
          let detectedFace = _.find(this.detectedFaces, { faceId: identifiedFace.faceId });
          detectedFace.identifiedPerson = true;
          detectedFace.identifiedPersonId = identifiedFace.candidates[0].personId;
          detectedFace.identifiedPersonConfidence = identifiedFace.candidates[0].confidence;
          obsList.push(this.faceApi.getPerson(this.selectedGroupId, identifiedFace.candidates[0].personId));

         // let identifiedPerson = _.find(this.identifiedPersons, { 'personId':  detectedFace.identifiedPersonId });
          //this.selectedFace.name = detectedFace.name;
        }
      });

      // Call getPerson() for each identified face
      forkJoin(obsList).subscribe(results => {
       this.identifiedPersons = results;
       this.loading = false; 
       console.log('**identify persons:',this.identifiedPersons); 
       this.name = this.identifiedPersons[0].name;
       console.log('**identify name:',this.identifiedPersons[0].name);   
      });

      
    });
  });
     // this.identify();
     // this.faceClicked(this.detectedFaces);
    }
    catch(error)
    {
      console.error(error);
    }
    
  }

  imageLoaded($event) 
  {
    this.selectedFace = null;
    this.detectedFaces = [];
    let img = this.mainImg.nativeElement;
    this.multiplier = img.clientWidth / img.naturalWidth;
  }

  public uploadFinished = (event) => {
    this.response = event;
    this.imageUrl =  localStorage["imageurl"];
    console.log('imge url:'+ this.imageUrl);  
    this.showCamera = false;  
  }

  OpenCapture()
  {
    if (this.showCamera)
    {
      this.showCamera = false;
      this.cameraButtonText = "Open Camera";
    }
    else
    {
      this.showCamera = true;
      this.cameraButtonText = "Close Camera";
    }
  }
  
}
