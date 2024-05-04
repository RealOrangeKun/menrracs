// import Footer from './Footer.tsx'
import LoginCard from './LoginCard.tsx'
import SignUpCard from './SignUpCard.tsx'
import Header from './Header.tsx'
import NotFound from './notFound.tsx'
import HomePage from './homePage.tsx'
import Files from './files.tsx'
import About from './About.tsx'
import Contact from './Contact.tsx'
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
           <Route path="/homePage" element={
            <>
            <Header/>
            <HomePage />
            </>}
          />
           <Route path="/files" element={
            <>
            <Header/>
            <Files />
            </>}
          />
           <Route path="/about" element={
            <>
            <Header/>
            <About />
            </>}
          />
           <Route path="/contact" element={
            <>
            <Header/>
            <Contact />
            </>}
          />
      </Routes>
    </BrowserRouter>
    </CookiesProvider>
  );
}

export default App
