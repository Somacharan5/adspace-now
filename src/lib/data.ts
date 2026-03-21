export interface Billboard {
  id: string;
  title: string;
  location: string;
  city: string;
  price: number;
  image: string;
  type: "Hoarding" | "Digital" | "Unipole" | "Bus Shelter";
  size: string;
  trafficEstimate: string;
  tags: string[];
  lat: number;
  lng: number;
}

export const billboards: Billboard[] = [
  {
    id: "1",
    title: "MG Road Premium Hoarding",
    location: "MG Road, Near Brigade Gateway",
    city: "Bangalore",
    price: 45000,
    image: "billboard-1",
    type: "Hoarding",
    size: "40ft × 20ft",
    trafficEstimate: "1.2L+ daily impressions",
    tags: ["High Traffic", "Premium"],
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "2",
    title: "Andheri Digital Billboard",
    location: "Western Express Highway, Andheri",
    city: "Mumbai",
    price: 75000,
    image: "billboard-2",
    type: "Digital",
    size: "30ft × 15ft",
    trafficEstimate: "2.5L+ daily impressions",
    tags: ["Digital", "Popular"],
    lat: 19.1136,
    lng: 72.8697,
  },
  {
    id: "3",
    title: "NH-48 Highway Unipole",
    location: "NH-48, Near Manesar Toll",
    city: "Gurugram",
    price: 30000,
    image: "billboard-3",
    type: "Unipole",
    size: "50ft × 25ft",
    trafficEstimate: "80K+ daily impressions",
    tags: ["Budget Friendly", "Highway"],
    lat: 28.4595,
    lng: 77.0266,
  },
  {
    id: "4",
    title: "T Nagar Market Billboard",
    location: "Usman Road, T Nagar",
    city: "Chennai",
    price: 35000,
    image: "billboard-4",
    type: "Hoarding",
    size: "30ft × 15ft",
    trafficEstimate: "1.5L+ daily impressions",
    tags: ["High Traffic", "Market Area"],
    lat: 13.0418,
    lng: 80.2341,
  },
  {
    id: "5",
    title: "Connaught Place Digital",
    location: "Rajiv Chowk, Connaught Place",
    city: "Delhi",
    price: 95000,
    image: "billboard-1",
    type: "Digital",
    size: "25ft × 12ft",
    trafficEstimate: "3L+ daily impressions",
    tags: ["Premium", "Landmark"],
    lat: 28.6315,
    lng: 77.2167,
  },
  {
    id: "6",
    title: "Salt Lake Sector V Hoarding",
    location: "Sector V, Near TCS Office",
    city: "Kolkata",
    price: 22000,
    image: "billboard-3",
    type: "Hoarding",
    size: "35ft × 18ft",
    trafficEstimate: "60K+ daily impressions",
    tags: ["Budget Friendly", "IT Hub"],
    lat: 22.5726,
    lng: 88.3639,
  },
];
