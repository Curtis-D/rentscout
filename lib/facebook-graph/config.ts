// Price extraction patterns for Philippine listings
export const PRICE_PATTERNS = [
  /₱\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
  /PHP\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:pesos|php)/i,
  /(\d{1,2}[kK])/
]

// Location patterns for Philippine cities and areas
export const LOCATION_PATTERNS = {
  cities: [
    'Manila', 'Makati', 'Taguig', 'Quezon City', 'Pasig', 
    'Mandaluyong', 'Pasay', 'Parañaque', 'Las Piñas', 
    'Muntinlupa', 'Marikina', 'San Juan', 'Caloocan',
    'Malabon', 'Navotas', 'Valenzuela', 'Cebu City',
    'Davao City', 'Antipolo', 'Cainta', 'Taytay'
  ],
  
  areas: [
    'BGC', 'Ortigas', 'Ayala', 'Rockwell', 'Eastwood',
    'Greenhills', 'Alabang', 'MOA', 'NAIA', 'McKinley',
    'Poblacion', 'Salcedo', 'Legaspi', 'Greenbelt'
  ]
}