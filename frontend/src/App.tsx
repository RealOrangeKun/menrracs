// import Footer from './Footer.tsx'
import LoginCard from './LoginCard.tsx'
import SignUpCard from './SignUpCard.tsx'
import Header from './Header.tsx'
import NotFound from './notFound.tsx'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {CookiesProvider} from "react-cookie"; 
function App() {
  return(
    <CookiesProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
          <Header/>
         

          <LoginCard />
          
          </>}
        />
        <Route path="/SignUp" element={
          <>
          <Header/>
          <SignUpCard />
          </>}
        />
          <Route path="/notFound" element={
            <>
            <Header/>
            <NotFound />
            </>}
          />
      </Routes>
    </BrowserRouter>
    </CookiesProvider>
  );
}

export default App
