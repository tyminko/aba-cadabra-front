export NODE_OPTIONS=--openssl-legacy-provider
npm run build

// From types.d.ts
interface Location {
  address: string,
  city: string,
  country: string,
  countryCode: string,
  lat: number,
  lng: number
}

mapOptions: {
  disableDefaultUI: true,
  backgroundColor: '#fff',
  styles: [...abaMapStyle.basic]
}
