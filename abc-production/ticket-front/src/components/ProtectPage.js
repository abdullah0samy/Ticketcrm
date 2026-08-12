import React from 'react'
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { Container } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectPage({ component }) {

    const { isUser } = useSelector((state) => state.user)

    if (!isUser) {
        return <Navigate to="/login" />
    }
    else {
        return (
            <>
                <Sidebar />
                <main className="main-content">
                    <Header />
                    <Container className='py-3'>
                        {component}
                    </Container>
                </main>
            </>
        )
    }

}

export default ProtectPage