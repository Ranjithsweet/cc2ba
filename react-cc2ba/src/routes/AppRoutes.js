import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

const Home = lazy(() => import('../Frontend/Home'));
const AboutUs = lazy(() => import('../Frontend/AboutUs'));
const ContactUs = lazy(() => import('../Frontend/ContactUs'));
const Services = lazy(() => import('../Frontend/Services'));
const CustomerLogin = lazy(() => import('../Frontend/Authentication/CustomerLogin'));
const AdminLogin = lazy(() => import('../Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../Admin/AdminDashboard'));
const AdminProfile = lazy(() => import('../Admin/AdminProfile'));
const Dashboard = lazy(() => import('../Frontend/Dashboard/Dashboard'));

function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="aboutus" element={<AboutUs />} />
          <Route path="contactus" element={<ContactUs />} />
          <Route path="services" element={<Services />} />
          <Route path="login" element={<CustomerLogin />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
