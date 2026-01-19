import "./App.css";
import GameManager from "./components/GameManager";

/**
 * App Component
 * Root component that renders the multi-level game system.
 * Delegates game management to the GameManager component.
 */
function App() {
  return <GameManager />;
}

export default App;
