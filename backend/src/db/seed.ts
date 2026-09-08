import type { PoolClient } from "pg";

const products = [
  ["Human Hydration Cylinder", "For storing approved Earth liquids.", "Human Essentials", 14.99, 42, "🥤", "Human Approved"],
  ["Emotional Support Potato", "Provides no licensed counseling services.", "Pets & Creatures", 6.99, 88, "🥔", "Gary Recommends"],
  ["Communication Rectangle", "Humans apparently stare at these for several hours per day.", "Earth Technology", 299.99, 12, "📱", "Earth-Compatible"],
  ["One Human Shoe", "Second shoe sold separately.", "Human Essentials", 12.50, 31, "👟", "Limited Supply"],
  ["Emergency Frog", "For emergencies. Do not ask which ones.", "Pets & Creatures", 3.99, 19, "🐸", "Probably Safe"],
  ["Premium Earth Air", "Collected locally.", "Human Essentials", 19.99, 120, "💨", "Human Approved"],
  ["Suspiciously Cheap Laptop", "Runs at least one program.", "Earth Technology", 29.99, 7, "💻", "Probably Safe"],
  ["Universal Translator", "Currently supports English and louder English.", "Earth Technology", 79.99, 15, "📡", "Gary Recommends"],
  ["Anti-Bug Spray", "Guaranteed to remove at least some bugs.", "Household Objects", 11.99, 54, "🧴", "Human Approved"],
  ["Mystery Egg", "Something may hatch.", "Mystery Inventory", 9.99, 23, "🥚", "Probably Safe"],
  ["Gravity Refill", "Not compatible with all planets.", "Space Travel Supplies", 7.50, 66, "🧲", "Limited Supply"],
  ["Standard Earth Chair", "Supports most humanoid sitting configurations.", "Household Objects", 44.99, 18, "🪑", "Earth-Compatible"],
  ["Moon Dust", "Definitely obtained legally.", "Space Travel Supplies", 18.00, 35, "🌙", "Probably Safe"],
  ["Tiny Planet", "Not to scale.", "Mystery Inventory", 39.00, 9, "🪐", "Gary Recommends"],
  ["Human Celebration Candle", "Previously ignited once.", "Household Objects", 2.99, 101, "🕯️", "Human Approved"],
  ["Dehydrated Ocean", "Just add several trillion liters of water.", "Space Travel Supplies", 24.00, 11, "🌊", "Limited Supply"],
  ["Certified Sandwich Cube", "All the flavor of lunch, now with corners.", "Food-ish Items", 8.49, 27, "🥪", "Human Approved"],
  ["Pocket-Sized Black Hole", "Great for crumbs. Warranty excludes spacetime.", "Household Objects", 59.99, 4, "⚫", "Probably Safe"],
  ["Instant Tuesday", "For when your week needs more Tuesday.", "Mystery Inventory", 4.25, 70, "📅", "Gary Recommends"],
  ["Comet Trail Mix", "Contains nuts, raisins, and trace amounts of velocity.", "Food-ish Items", 5.99, 46, "☄️", "Earth-Compatible"],
  ["Robot Apology Card", "Says sorry in twelve machine-readable formats.", "Earth Technology", 3.50, 64, "🤖", "Human Approved"],
  ["Solar-Powered Flashlight", "Works wonderfully in direct sunlight.", "Space Travel Supplies", 16.75, 22, "🔦", "Gary Recommends"],
  ["Invisible Goldfish", "Bowl not included. Fish possibly not included.", "Pets & Creatures", 13.25, 6, "🐟", "Limited Supply"],
  ["Left-Handed Spork", "Right-handed beings may experience mild confusion.", "Food-ish Items", 4.99, 38, "🥄", "Earth-Compatible"]
] as const;

export async function seed(client: PoolClient) {
  const count = await client.query<{ count: string }>("SELECT COUNT(*)::text AS count FROM products");
  if (Number(count.rows[0]?.count) > 0) return;
  for (const p of products) {
    await client.query("INSERT INTO products (name,description,category,price,inventory,image_url,badge) VALUES ($1,$2,$3,$4,$5,$6,$7)", [...p]);
  }
  const comments = ["Five stars. Object successfully existed.", "Worked exactly once.", "My human seemed pleased.", "I do not understand what this does."];
  for (let id = 1; id <= products.length; id++) {
    await client.query("INSERT INTO reviews (product_id,reviewer_name,rating,comment) VALUES ($1,$2,$3,$4)", [id, id % 2 ? "Zorp" : "A Local Human", 4 + (id % 2), comments[id % comments.length]]);
  }
}
