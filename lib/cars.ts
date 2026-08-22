export type Car = {
  id: string;
  name: string;
  make: string;
  year: number;
  price: number;
  rating: number;
  reviews: number;
  location: string;
  transmission: "Automatic" | "Manual";
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  seats: number;
  image: string;
  owner: string;
  verified: boolean;
  description: string;
  features: string[];
};

export const cars: Car[] = [
  { id: "golf-8", name: "Volkswagen Golf 8", make: "Volkswagen", year: 2023, price: 8, rating: 4.9, reviews: 42, location: "Pristina", transmission: "Automatic", fuel: "Petrol", seats: 5, image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1400&q=85", owner: "Arber K.", verified: true, description: "Clean, comfortable Golf 8 that is ideal for city trips, errands and short drives around Kosovo.", features: ["Apple CarPlay", "Parking sensors", "Bluetooth", "Air conditioning"] },
  { id: "bmw-3", name: "BMW 3 Series", make: "BMW", year: 2022, price: 12, rating: 4.8, reviews: 31, location: "Pristina", transmission: "Automatic", fuel: "Petrol", seats: 5, image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1400&q=85", owner: "Dren M.", verified: true, description: "A refined 3 Series with a comfortable interior and confident handling for longer drives.", features: ["Navigation", "Cruise control", "Leather interior", "Parking camera"] },
  { id: "a-class", name: "Mercedes-Benz A-Class", make: "Mercedes-Benz", year: 2024, price: 14, rating: 5.0, reviews: 18, location: "Pristina", transmission: "Automatic", fuel: "Hybrid", seats: 5, image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1400&q=85", owner: "Lira H.", verified: true, description: "Nearly-new A-Class with a premium cabin and excellent city fuel economy.", features: ["CarPlay", "LED lights", "Heated seats", "360° camera"] },
  { id: "tesla-3", name: "Tesla Model 3", make: "Tesla", year: 2023, price: 15, rating: 4.9, reviews: 27, location: "Pristina", transmission: "Automatic", fuel: "Electric", seats: 5, image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1400&q=85", owner: "Blerim R.", verified: true, description: "Quiet, quick and fully electric. A great choice for an easy urban drive.", features: ["Autopilot", "Glass roof", "Fast charging", "Navigation"] },
  { id: "octavia", name: "Skoda Octavia", make: "Skoda", year: 2021, price: 7, rating: 4.7, reviews: 56, location: "Pristina", transmission: "Manual", fuel: "Diesel", seats: 5, image: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1400&q=85", owner: "Valon S.", verified: true, description: "Practical, spacious and economical for everyday trips and weekend travel.", features: ["Large trunk", "Bluetooth", "Cruise control", "Rear sensors"] },
  { id: "yaris", name: "Toyota Yaris", make: "Toyota", year: 2022, price: 7, rating: 4.8, reviews: 39, location: "Pristina", transmission: "Automatic", fuel: "Hybrid", seats: 5, image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1400&q=85", owner: "Era T.", verified: true, description: "Compact hybrid that is easy to park and efficient for busy city days.", features: ["Hybrid", "Rear camera", "Lane assist", "Bluetooth"] },
];

export function getCar(id: string) {
  return cars.find((car) => car.id === id);
}
