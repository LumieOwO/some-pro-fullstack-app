import { BrowserRouter as Router } from "react-router-dom";
import App from "./App"; // Your App component file

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
