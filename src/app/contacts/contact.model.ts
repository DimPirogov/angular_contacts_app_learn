export interface Contact {
  icon: string,
  id: string,
  personal: boolean,
  firstName: string,
  lastName: string,
  dateOfBirth: Date | null, //string,
  favoritesRanking: number | null,
  // phone: Partial<Phone>,
  // phone: Phone,
  phones: Phone[],
  addresses: Address[],
  notes: string
}

export interface Phone {
  phoneNumber: string,
  phoneType: string,
  preferred: boolean,
}

export interface Address {
  streetAddress: string,
  city: string,
  state: string,
  postalCode: string,
  addressType: string,
}

export const phoneTypeValues =  [
  { title: 'Mobile', value: 'mobile' },
  { title: 'Work', value: 'work' },
  { title: 'Other', value: 'other' },
];

export const addressTypeValues =  [
  { title: 'Home', value: 'home' },
  { title: 'Work', value: 'work' },
  { title: 'Other', value: 'other' },
];
