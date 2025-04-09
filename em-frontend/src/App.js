import { BrowserRouter, Route, Routes } from "react-router-dom";
import Employee from "./containers/employee/Employee";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <>
      <BrowserRouter>
      <h2 className="text-center">Employee Management</h2>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Employee/>}/>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
