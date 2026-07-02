// App renders the main dashboard page
import Dashboard from "./pages/Dashboard";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
    return (
    <>
      <Toaster position="top-right" />
      <Dashboard />
    </>
  );
}

export default App;