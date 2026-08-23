export type DemoRole = "renter" | "provider" | "admin";

export const demoAccounts = [
  { email: "renter@kerreore.test", password: "Kerreore123!", role: "renter" as const, name: "Test Renter" },
  { email: "provider@kerreore.test", password: "Kerreore123!", role: "provider" as const, name: "Test Car Provider" },
  { email: "admin@kerreore.test", password: "Kerreore123!", role: "admin" as const, name: "Kerreore Admin" },
];

export function getDemoAccount(email: string, password: string) {
  return demoAccounts.find((account) => account.email === email && account.password === password);
}
