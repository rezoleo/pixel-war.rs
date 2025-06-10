use bcrypt::{DEFAULT_COST, hash};

fn main() {
    let password = "password"; // Example password to hash, replace with your own

    // Hash the password
    let hashed = hash(password, DEFAULT_COST).expect("Hashing failed");
    println!("Hashed password: {}", hashed);
}
