import { createBrowserRouter } from 'react-router-dom';
import Home from '../pages/Home';
import Vote from '../pages/Vote';
import Results from '../pages/Results';
import Layout from '../components/Layout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'vote',
        element: <Vote />,
      },
      {
        path: 'results',
        element: <Results />,
      },
    ],
  },
]);
