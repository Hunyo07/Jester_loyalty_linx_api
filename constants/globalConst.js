const adminRole = ["admin"];
const userRole = ["user"];
const merchantRole = ["merchant"];
const incomeSource = [
  { id: 1, name: "Salary or wages" },
  { id: 2, name: "Freelance" },
  { id: 3, name: "Business profits" },
  { id: 4, name: "Remittances" },
  { id: 5, name: "Other" },
];

const incomeSourceAmount = [
  { id: 1, name: "5,000 to 12,000" },
  { id: 2, name: "12,001 to 18,000" },
  { id: 3, name: "18,001 to 25,000" },
  { id: 4, name: "25,001 to 32,000" },
  { id: 5, name: "32,001 up" },
];

export { adminRole, userRole, merchantRole, incomeSource, incomeSourceAmount };
