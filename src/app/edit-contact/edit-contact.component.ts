import { Address } from './../contacts/contact.model';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ContactsService } from './../contacts/contacts.service';
import { phoneTypeValues, addressTypeValues } from '../contacts/contact.model';
import { restrictedWords } from '../validator/restricted-words.validator';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  templateUrl: './edit-contact.component.html',
  styleUrls: ['./edit-contact.component.css']
})
export class EditContactComponent implements OnInit {
  phoneTypes = phoneTypeValues;
  addressTypes = addressTypeValues;

  // contactForm = new Formgroup({
  //   id: new FormControl(),
  //   firstName: new FormControl(),
  //   lastName: new FormControl(),
  //   dateOfBirth: new FormControl(),
  //   favoritesRanking: new FormControl(),
  //   phone: new FormGroup({
  //     phoneNumber: new FormControl(),
  //     phoneType: new FormControl()
  //   }),
  //   address: new FormGroup({
  //     streetAddress: new FormControl(),
  //     city: new FormControl(),
  //     state: new FormControl(),
  //     postalCode: new FormControl(),
  //     addressType: new FormControl(),
  //   })
  contactForm = this.fb.nonNullable.group({
    id: '',
    icon: '',
    personal: false,
    firstName: ['', [Validators.required, Validators.minLength(3) ]],
    lastName: '',
    dateOfBirth: <Date | null>null,
    // dateOfBirth: '', // when working as a string only
    favoritesRanking: <number | null>null,

    // phone: this.fb.nonNullable.group({
    //   phoneNumber: '',
    //   phoneType: ''
    // }),

    // phones: this.createPhoneGroup(), // we created a function
    phones: this.fb.array([this.createPhoneGroup()]),
    addresses: this.fb.array([this.createAddressGroup()]),
    // notes: ['', restrictedWords],
    notes: ['', restrictedWords(['foo', 'bar'])],
  });

  constructor(private route: ActivatedRoute,
              private contactsService: ContactsService,
              private router: Router,
              private fb: FormBuilder
  ) { }

  ngOnInit() {
    const contactId = this.route.snapshot.params['id'];
    if (!contactId){
      this.subsribeToAddressChanges();  // for new contact
      return;
    };

    this.contactsService.getContact(contactId).subscribe(
      (contact) => {
        if(!contact) return;

        // to loop extra for the arrays (extra) phones
        // we looping from 1 because the first phone is alredy loaded
        for (let i = 1; i < contact.phones.length; i++) {
          //this.contactForm.controls.phones.push(this.createPhoneGroup());
          this.addPhone();
        }
        for (let i = 1; i < contact.addresses.length; i++){
          this.addAddress();
        }

        this.contactForm.setValue(contact);
        //-----------------------------------------------------------------
        // const names = { firstName: contact.firstName, lastName: contact.lastName };
        // this.contactForm.patchValue(names);
        //-----------------------------------------------------------------
        // this.contactForm.controls.id.setValue(contact.id);
        // this.contactForm.controls.firstName.setValue(contact.firstName);
        // this.contactForm.controls.lastName.setValue(contact.lastName);
        // this.contactForm.controls.dateOfBirth.setValue(contact.dateOfBirth);
        // this.contactForm.controls.favoritesRanking.setValue(contact.favoritesRanking);
        // this.contactForm.controls.phone.controls.phoneNumber.setValue(contact.phone.phoneNumber);
        // this.contactForm.controls.phone.controls.phoneType.setValue(contact.phone.phoneType);
        // this.contactForm.controls.address.controls.streetAddress.setValue(contact.address.streetAddress);
        // this.contactForm.controls.address.controls.city.setValue(contact.address.city);
        // this.contactForm.controls.address.controls.state.setValue(contact.address.state);
        // this.contactForm.controls.address.controls.postalCode.setValue(contact.address.postalCode);
        // this.contactForm.controls.address.controls.addressType.setValue(contact.address.addressType);
        //-----------------------------------------------------------------
        this.subsribeToAddressChanges();  // to subscribe after changes
      });
  }

  subsribeToAddressChanges() {
    const addressGroup = this.contactForm.controls.addresses; // to shorten
    addressGroup.valueChanges
      .pipe(distinctUntilChanged(this.stringigyCompare))
      .subscribe(() => {
        for (const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.removeValidators([Validators.required]); // remove the "required"
          addressGroup.get(controlName)?.updateValueAndValidity();
          // updating
        }
      });
    addressGroup.valueChanges
      .pipe(debounceTime(2000), distinctUntilChanged(this.stringigyCompare))
      .subscribe(() => {
        for (const controlName in addressGroup.controls) {
          addressGroup.get(controlName)?.addValidators([Validators.required]); // adding the "required"
          addressGroup.get(controlName)?.updateValueAndValidity();
        }
      });
  }

  stringigyCompare(a: any, b: any){
    return JSON.stringify(a) === JSON.stringify(b)
  }

  createPhoneGroup() {
    const phoneGroup =  this.fb.nonNullable.group({
      phoneNumber: '',
      phoneType: '',
      preferred: false,
    });

    // phoneGroup.valueChanges // to subscribe to all changes in the group
    // phoneGroup.controls.preferred.statusChanges
      // emites when validity status changes

    phoneGroup.controls.preferred.valueChanges
      // .pipe(distinctUntilChanged((a ,b ) => JSON.stringify(a) === JSON.stringify(b))) // before creating a separate function
      .pipe(distinctUntilChanged(this.stringigyCompare))
      .subscribe(value => {
        if (value)
          phoneGroup.controls.phoneNumber.addValidators([Validators.required]);
        else
          phoneGroup.controls.phoneNumber.removeValidators([Validators.required]);
        phoneGroup.controls.phoneNumber.updateValueAndValidity();//realtime watch
      });
    return phoneGroup;
  }

  createAddressGroup() {
    const addressGroup = this.fb.nonNullable.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', Validators.required],
      addressType: '',
    });
    return addressGroup;
  }

  addPhone(){
    this.contactForm.controls.phones.push(this.createPhoneGroup());
  }

  addAddress(){
    this.contactForm.controls.addresses.push(this.createAddressGroup())
  }

  get firstName() { // creating like a shortcut for HTML template to use
    return this.contactForm.controls.firstName;
  }
  get notes() {
    return this.contactForm.controls.notes;
  }

  saveContact() {
    // this.contactsService.saveContact(this.contactForm.value).subscribe({
    //   next: () => this.router.navigate(['/contacts'])
    // })
    //----------------------------------------------------------------------
    this.contactsService.saveContact(this.contactForm.getRawValue()).subscribe({
      next: () => this.router.navigate(['/contacts'])
    })
  }
}
