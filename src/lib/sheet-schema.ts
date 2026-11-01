/** Tab names and header rows, shared by the OAuth and service-account paths. */

export const ORDERS_TAB = "Orders";
export const CUSTOMERS_TAB = "Customers";

export const ORDERS_HEADER = [
  "Order #", "Date", "Name", "Phone", "WhatsApp", "Email",
  "Items", "Total (NGN)", "Deliver to", "Notes", "Status",
];

export const CUSTOMERS_HEADER = [
  "Name", "Phone", "WhatsApp", "SMS Number", "Birthday", "Email", "City", "State",
  "Updates OK?", "Orders", "Total spent (NGN)", "First order", "Last order",
];

/** Normalises 0803… and +234 803… to one comparable form. */
export const normalisePhone = (s: string) =>
  s.replace(/\D/g, "").replace(/^0/, "234");
