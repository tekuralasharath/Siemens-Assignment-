import { Component, OnInit, ViewChild } from '@angular/core';
import { from } from 'rxjs';
import { EmployeedetailsService } from './services/employeedetails.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [NgbModalConfig, NgbModal]
})

export class AppComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  registerForm: FormGroup;
  submitted = false;
  public users: any = [];
  public deletedUsers: any = [];
  filterValues = {};
  delfilterValues = {};
  dataSource = new MatTableDataSource();
  deldataSource = new MatTableDataSource();
  displayedColumns: string[] = ['id', 'name', 'username', 'email', 'phone', 'action'];
  filterSelectObj = [];
  delfilterSelectObj = [];
  buttonname = "Submit";
  constructor(private formBuilder: FormBuilder, private empservices: EmployeedetailsService, config: NgbModalConfig, private modalService: NgbModal) {

    config.backdrop = 'static';
    config.keyboard = false;

    // Object to create Filter for
    this.filterSelectObj = [
      {
        name: 'id',
        columnProp: 'id',
        options: []
      }, {
        name: 'name',
        columnProp: 'name',
        options: []
      }, {
        name: 'username',
        columnProp: 'username',
        options: []
      }, {
        name: 'email',
        columnProp: 'email',
        options: []
      }, {
        name: 'phone',
        columnProp: 'phone',
        options: []
      }
    ]


    // Object to create Filter for
    this.delfilterSelectObj = [
      {
        name: 'id',
        columnProp: 'id',
        options: []
      }, {
        name: 'name',
        columnProp: 'name',
        options: []
      }, {
        name: 'username',
        columnProp: 'username',
        options: []
      }, {
        name: 'email',
        columnProp: 'email',
        options: []
      }, {
        name: 'phone',
        columnProp: 'phone',
        options: []
      }
    ]
  }
  open(content) {
    this.modalService.open(content);
  }
  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      id: [],
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      website: ['', [Validators.required]],
      //typeofoperation: ['CREATE'],
      company: this.addCompanyDetails(),
      address: this.addaddressDetails(),
    });
    this.getData();
    // Overrride default filter behaviour of Material Datatable
    this.dataSource.filterPredicate = this.createFilter();
  }

  addCompanyDetails(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      bs: ['', Validators.required],
      catchPhrase: ['', Validators.required]
    })
  }

  addaddressDetails(): FormGroup {
    return this.formBuilder.group({
      street: ['', Validators.required],
      suite: ['', Validators.required],
      zipcode: ['', Validators.required],
      city: ['', Validators.required],
      geo: this.addgeoDetails(),
    })
  }

  addgeoDetails(): FormGroup {

    return this.formBuilder.group({
      lat: ['', Validators.required],
      lng: ['', Validators.required]
    })
  }
  // convenience getter for easy access to form fields
  get f() { return this.registerForm.controls; }
  get g(): any {
    return this.registerForm.controls;
  }
  openScrollableContent(longContent) {
    this.onReset();
    this.modalService.open(longContent, { scrollable: true });
  }
  onSubmit() {
    debugger
    this.submitted = true;

    // stop here if form is invalid
    if (this.registerForm.invalid) {
      return;
    }
    if (this.buttonname == 'Submit') {
      let dataSourceLength = 0;
      let deldataSourceLength = 0;
      // display form values on success
      //let value = JSON.stringify(this.registerForm.value, null, 4);
      dataSourceLength = this.dataSource.data.length;
      deldataSourceLength = this.deldataSource.data.length;
      //const maxPeak = data.reduce((p, c) => p.id > c.id ? p : c);
      this.registerForm.controls.id.setValue(dataSourceLength + deldataSourceLength + 1);
      this.dataSource.data.push(this.registerForm.value);
      this.table.renderRows();
      this.onReset();
      this.modalService.dismissAll();
    } else if (this.buttonname == 'Update') {
      debugger;
      let editData = this.registerForm.value;
      let gridData = [];
      gridData = this.dataSource.data;
      this.dataSource.data = gridData.filter((value, key) => {
        if (value.id == editData.id) {
          console.log(value);
          value.name = editData.name;
          value.username = editData.username;
          value.email = editData.email;
          value.phone = editData.phone;
          value.website = editData.website;
          value.company.name = editData.company.name;
          value.company.bs = editData.company.bs;
          value.company.catchPhrase = editData.company.catchPhrase;
          value.address.street = editData.address.street;
          value.address.suite = editData.address.suite;
          value.address.city = editData.address.city;
          value.address.zipcode = editData.address.zipcode;
          value.address.geo.lat = editData.address.geo.lat;
          value.address.geo.lng = editData.address.geo.lng;
        }
        return true;
      }); 
      this.table.renderRows();
      this.onReset();
      this.modalService.dismissAll();
      this.buttonname="Submit";
    }
  }
  DeleteData(event) {
    debugger;
    let totData = this.dataSource.data;
    const index: number = this.dataSource.data.indexOf(event);
    if (index !== -1) {
      this.dataSource.data.splice(index, 1);
      // this.users.splice(index, 1);
    }
    this.table.renderRows();
    this.deletedUsers.push(event);
    this.deldataSource.data = this.deletedUsers;
    this.delfilterSelectObj.filter((o) => {
      o.options = this.getFilterObject(this.deletedUsers, o.columnProp);
    });
    this.deldataSource.filterPredicate = this.createFilter();
  }

  Edit(longContent, event) {
    debugger;
    this.buttonname = "Update";
    this.modalService.open(longContent, { scrollable: true });
    this.registerForm.setValue(event);
  }

  // Called on Filter change
  delfilterChange(filter, event) {
    //let filterValues = {}
    this.delfilterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    this.deldataSource.filter = JSON.stringify(this.delfilterValues)
  }
  RestoreDeleteData(event) {
    debugger;
    const index: number = this.deldataSource.data.indexOf(event);
    if (index !== -1) {
      this.deldataSource.data.splice(index, 1);
      //this.deletedUsers.splice(index, 1);
    }
    //this.table.renderRows();
    this.users.push(event);
    this.dataSource.data = this.users;
    this.filterSelectObj.filter((o) => {
      o.options = this.getFilterObject(this.users, o.columnProp);
    });
    this.dataSource.filterPredicate = this.createFilter();
    this.delresetFilters();
  }

  onReset() {
    this.submitted = false;
    this.registerForm.reset();
  }
  // Get remote serve data using HTTP call
  getData() {
    //users data
    this.empservices.getUsers().subscribe(data => {
      this.users = data;
      this.dataSource.data = this.users;
      this.filterSelectObj.filter((o) => {
        o.options = this.getFilterObject(this.users, o.columnProp);
      });
    });

  }
  // Get Uniqu values from columns to build filter
  getFilterObject(fullObj, key) {
    const uniqChk = [];
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }

  // Called on Filter change
  filterChange(filter, event) {
    //let filterValues = {}
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  // Custom filter method fot Angular Material Datatable
  createFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      console.log(searchTerms);

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            searchTerms[col].trim().toLowerCase().split(' ').forEach(word => {
              if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
                found = true
              }
            });
          }
          return found
        } else {
          return true;
        }
      }
      return nameSearch()
    }
    return filterFunction
  }


  // Reset table filters
  resetFilters() {
    this.filterValues = {}
    this.filterSelectObj.forEach((value, key) => {
      value.modelValue = undefined;
    })
    this.dataSource.filter = "";
  }

  // Reset table filters
  delresetFilters() {
    this.delfilterValues = {}
    this.delfilterSelectObj.forEach((value, key) => {
      value.modelValue = undefined;
    })
    this.deldataSource.filter = "";
  }

}
