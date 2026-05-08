import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';
import { WorkflowBuilderPage } from '@/pages/WorkflowBuilderPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/workflows',
        element: <WorkflowsPage />,
      },
      {
        path: '/workflows/:id/builder',
        element: <WorkflowBuilderPage />,
      },
    ],
  },
]);
