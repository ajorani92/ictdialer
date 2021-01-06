import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TextService } from './text.service';
import { MatSort, MatPaginator } from '@angular/material';
import { TextDatabase } from './text-database.component';
import { TextDataSource } from './text-datasource.component';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../../../modal.component';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'ngx-text-component',
  templateUrl: './text-component.html',
  styleUrls: ['./text-component.scss'],
})

export class FormsTextComponent implements OnInit {
  constructor(private text_service: TextService, private modalService: NgbModal) { }

  aText: TextDataSource | null;
  length: number;
  closeResult: any;

  displayedColumns= ['ID', 'name', 'type', 'length', 'Operations'];
  @ViewChild(MatSort, {static: false}) sort: MatSort;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  @ViewChild('filter', {static: false}) filter: ElementRef;

  ngOnInit() {
    this.getTextlist();
  }

  getTextlist() {
    this.text_service.get_TextList().then(data => {
      this.length = data.length;
      this.aText = new TextDataSource(new TextDatabase( data ), this.sort, this.paginator);

      // Observable for the filter
      Observable.fromEvent(this.filter.nativeElement, 'keyup')
     .debounceTime(150)
     .distinctUntilChanged()
     .subscribe(() => {
       if (!this.aText) { return; }
       this.aText.filter = this.filter.nativeElement.value;
      });
    });
  }

  deleteText(text_id): void {
    this.text_service.delete_Text(text_id).then(response => {
    })
    .catch(this.handleError);
    this.getTextlist();
  }

  // Modal related
  showStaticModal(name, text_id) {
    const activeModal = this.modalService.open(ModalComponent, {
      size: 'sm',
      container: 'nb-layout',
    });

    activeModal.componentInstance.modalHeader = 'Alert';
    activeModal.componentInstance.modalContent = `Are you sure you want to delete ${name}?`;
    activeModal.result.then((result) => {
      this.closeResult = result;
      if (this.closeResult === 'yes_click') {
        this.deleteText(text_id);
      }
    }, (reason) => {
      this.closeResult = this.getDismissReason(reason);
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
}
