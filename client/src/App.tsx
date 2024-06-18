import { useState } from "react";
import Join from "./pages/Join/Join";
import Room from "./pages/Room";

export default function App() {
  const [isCall, setIsCall] = useState(false);
  return (
    <div className="app">
      {!isCall ? <Join setIsCall={setIsCall} /> : <Room />}
    </div>
  );
}
