export default function Home() {
  return (
    <form method="POST" action="/api/admin-login">
      <input
        type="password"
        name="password"
        placeholder="Enter admin password"
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
