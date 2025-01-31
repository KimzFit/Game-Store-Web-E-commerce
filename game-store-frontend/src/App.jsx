import Register from './Register';
import './App.css';
import {BrowserRouter, Routes , Route} from 'react-router-dom'
import Login from './Login';
import Homepage from './page/Homepage';
import GameShopping from './page/GameShopping';
import EditProfile from './page/EditProfile';
import GameDetails from './page/GameDetails';
import { AnimatePresence } from 'framer-motion';
import Transaction from './page/Transaction';


function App() {
  

  return (

    <>
      <AnimatePresence mode='wait'>
      <BrowserRouter>
       
      <Routes>
      <Route path='/' element={<Homepage></Homepage>}></Route>
      <Route path='/register' element={<Register />}></Route>
      <Route path='/login' element={<Login />}></Route>
      <Route path='/gameshop' element={<GameShopping></GameShopping>}></Route>
      <Route path='/editprofile' element={<EditProfile></EditProfile>}></Route>
      <Route path='/game/:id' element={<GameDetails></GameDetails>}></Route>
      <Route path='/transaction/:buyer_id' element={<Transaction></Transaction>}></Route>
      </Routes>
      </BrowserRouter> 
      </AnimatePresence>
    </>
  );
}

export default App;
