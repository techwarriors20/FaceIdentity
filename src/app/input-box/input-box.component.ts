import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-input-box',
  templateUrl: './input-box.component.html',
  styleUrls: ['./input-box.component.css']
})
export class InputBoxComponent implements OnInit {
  public properties: InputModalProperties;
  public inputValue = '';
  public response: {'imageUrl': ''}; 

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() { }

  save() {
    this.activeModal.close(this.inputValue);
  }

  public uploadFinished = (event) => {
    this.response = event;
    this.inputValue =  localStorage["imageurl"];
    console.log('imge url:'+ this.inputValue);  
     
  }
}


export class InputModalProperties {
  title: string;
  message: string;
}