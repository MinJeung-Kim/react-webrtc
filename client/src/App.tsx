import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Header } from "./components/Header/Header";
import Conference from "./pages/Conference";
import CreateRoom from "./pages/CreateRoom/CreateRoom";
import "./App.css";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <RoutesWithNavigation />
      </BrowserRouter>
    </div>
  );
}
function RoutesWithNavigation() {
  const navigate = useNavigate();

  const onCreateRoom = () => {
    navigate("/");
  };

  const onLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      // logout();
      navigate("/");
    }
  };

  return (
    <>
      <Header
        username={"Roxie"}
        onLogout={onLogout}
        onCreateRoom={onCreateRoom}
      />
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/:roomId" element={<Conference />} />
      </Routes>
    </>
  );
}
export default App;
