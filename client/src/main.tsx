import { createRoot } from 'react-dom/client'
import { RouterProvider , createRoutesFromElements, Route, createBrowserRouter } from 'react-router-dom'
import App from './App'
import Sender from './components/sender'
import Receiver from './components/receiver'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path ='/' element = {<App/>}> 

      <Route path = '/sender' element ={<Sender></Sender>}></Route>
      <Route path ='/receiver' element = {<Receiver></Receiver>}></Route>
    </Route>

  )
)
createRoot(document.getElementById('root')!).render(
  
  <RouterProvider router = {router}></RouterProvider>
   

)
