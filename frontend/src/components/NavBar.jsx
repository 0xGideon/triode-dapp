import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link>{" "}
      <Link to="/app">Dapp</Link>{" "}
      <Link to="/info">Info</Link>{" "}
      <button type="button">Connect Wallet</button>
    </nav>
  );
}
