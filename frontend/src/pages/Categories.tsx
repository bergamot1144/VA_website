import React from 'react';
import { Navigate } from 'react-router-dom';

// Перенаправляем на главную страницу, которая уже показывает категории
const Categories: React.FC = () => {
  return <Navigate to="/" replace />;
};

export default Categories;

