// frontend\src\components\root\index.js

import React from 'react';
import Navigation from '../navigation';
import { Outlet } from 'react-router-dom';
import Footer from "../footer";

const Root = () => {
    return (
        <>
            <Navigation/>
            <Outlet />
            <Footer/>
        </>
    );
};

export default Root;