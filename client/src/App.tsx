import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Provider as JotaiProvider } from "jotai";
import RoomPage from "./pages/Room/Room";
import LobbyPage from "./pages/Lobby/Lobby";
import { Header } from "./components/Header/Header";
import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.app}>
      <BrowserRouter>
        <JotaiProvider>
          <RoutesWithNavigation />
        </JotaiProvider>
      </BrowserRouter>
    </div>
  );
}
function RoutesWithNavigation() {
  const navigate = useNavigate();

  const onLogout = () => {
    if (window.confirm("Do you want to log out?")) {
      // logout();
      navigate("/");
    }
  };

  return (
    <>
      <Header username={"Roxie"} onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/:roomId" element={<RoomPage />} />
      </Routes>
    </>
  );
}
export default App;
