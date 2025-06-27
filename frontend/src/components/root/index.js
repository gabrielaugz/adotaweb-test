import React from 'react';
import Navigation from '../navigation';
import { Outlet } from 'react-router-dom';
import Footer from "../footer";
import ScrollToTop from '../components/ScrollToTop';

const Root = () => {
    return (
        <>
            <ScrollToTop />
            <Navigation/>
            <Outlet />
            <Footer/>
        </>
    );
};

export default Root;