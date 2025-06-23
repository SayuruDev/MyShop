import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import Home from "./components/Home";

function App() {
  return (
    <Router>
    <div className="App">
     
       <Header />
           <div className="container">
             <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
           </div>
      
       <Footer />
   
    </div>
    </Router>
  );
}

export default App;
