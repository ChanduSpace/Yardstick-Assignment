import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Notes from "./components/Notes";
import "./App.css";

function App() {
  const { user } = useAuth();

  return <div className="App">{user ? <Notes /> : <Login />}</div>;
}

export default App;
