CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0), inventory INTEGER NOT NULL CHECK (inventory >= 0),
  image_url TEXT NOT NULL, badge TEXT
);
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY, product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL, rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY, customer_name TEXT NOT NULL, email TEXT NOT NULL, shipping_planet TEXT NOT NULL,
  shipping_address TEXT NOT NULL, subtotal NUMERIC(10,2) NOT NULL, shipping NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL, discount NUMERIC(10,2) NOT NULL, total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Processing', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY, order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id), quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);
