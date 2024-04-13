import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Signup from './pages/Signup/Signup.jsx';
import Posts from './pages/Post/Posts.jsx';
import SignIn from './pages/SignIn/SignIn.jsx';


const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/register',
    element: <Signup />
  },
  {
    path: '/posts',
    element: <Posts/>
  },
  {
    path: '/signin',
    element: <SignIn/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router}>
        {/* <App /> */}
      </RouterProvider>
    </ApolloProvider>
  </React.StrictMode>,
)
