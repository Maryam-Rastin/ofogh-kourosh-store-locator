export type StoreType = 'Flagship' | 'Express' | 'Pickup';

export type Store = {
  id: number;
  name: string;
  type: StoreType;
  city: string;
  address: string;
  phone: string;
  hours: string;
  latitude: number;
  longitude: number;
};

export const stores: Store[] = [
  {
    id: 1,
    name: 'Ofogh Kourosh — Beheshti',
    type: 'Flagship',
    city: 'Tehran',
    address: '29 Pakistan St, Beheshti St',
    phone: '021-88510190',
    hours: '07:00–22:45',
    latitude: 35.7228,
    longitude: 51.4147
  },

  {
    id: 2,
    name: 'Ofogh Kourosh — Azadi',
    type: 'Express',
    city: 'Tehran',
    address: 'Azadi St, opposite Habibollah Metro, Shahidan St',
    phone: '021-66081604',
    hours: '07:00–22:45',
    latitude: 35.6998,
    longitude: 51.3428
  },

  {
    id: 3,
    name: 'Ofogh Kourosh — Yousef Abad',
    type: 'Pickup',
    city: 'Tehran',
    address: 'Yousef Abad St, Ibn Sina St, Alley 19/1, Niroo Building, No. 14',
    phone: '021-88105011',
    hours: '07:00–22:30',
    latitude: 35.7287,
    longitude: 51.4038
  },

  {
    id: 4,
    name: 'Ofogh Kourosh — Sadeghieh',
    type: 'Express',
    city: 'Tehran',
    address: 'Sadeghieh, between First and Second Square, Shahidane Sadeghieh Blvd',
    phone: '021-44287990',
    hours: '08:00–23:00',
    latitude: 35.7187,
    longitude: 51.3338
  },

  {
    id: 5,
    name: 'Ofogh Kourosh — Maali Abad',
    type: 'Flagship',
    city: 'Shiraz',
    address: 'Maali Abad, next to Arya Clinic, Ahoura Building',
    phone: '071-36341454',
    hours: '08:00–22:00',
    latitude: 29.6265,
    longitude: 52.5030
  },

  {
    id: 6,
    name: 'Ofogh Kourosh — Pasdaran',
    type: 'Pickup',
    city: 'Shiraz',
    address: 'Pasdaran Blvd, opposite Mohammad Rasoolollah Clinic, after Alley 68',
    phone: '071-38231834',
    hours: '08:00–22:00',
    latitude: 29.6035,
    longitude: 52.5540
  }
];