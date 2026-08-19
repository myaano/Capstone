export default function UserMenu({ user }) {
  return (
    <div className="dropdown">
      <button>{user.name} ▾</button>
      <div className="dropdown-content">
        {user.role === "admin" && <a href="/upload">Upload Paper</a>}
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}
