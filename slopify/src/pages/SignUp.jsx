import React, { useContext, useEffect  } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import UserContext from '../UserContext';

function SignUp() {
    const { me, refetchMe, isLoading: isAuthLoading } = useContext(UserContext);
    const navigate = useNavigate();

    const apiUrl = import.meta.env.VITE_SERVER_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
        }

        // You can send this data to your backend for authentication
        const body = data
        console.log(body);
        fetch(`${apiUrl}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })
        .then(response => {
            if(!response.ok) {
                let err = new Error("HTTP status code: " + response.status)
                err.response = response
                err.status = response.status
                throw err
            }
            return response.json()
        })
        .then(data => {
            navigate('/login');
        }).catch(err => {
            if (err.response) {
                err.response.json().then(errorData => {
                    console.error('Error:', errorData.message || 'Unknown error');
                    alert(errorData.message || 'Signup failed!');
                });
            } else {
                console.error('Error:', err.message);
                alert('An unexpected error occurred.');
            }
        }).finally(async () => {
            await refetchMe();
        })
    };
    
    if (isAuthLoading) return <div>Loading...</div>;
    if (me) return navigate('/map');

    return (<>
        <Container
            maxWidth="sm"
            style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    padding: 3,
                    boxShadow: 3,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h4" align="center" gutterBottom>
                    Create Account
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            variant="outlined"
                            required
                        />
                    </Box>
                    <Box mb={2}>
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            variant="outlined"
                            required
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Create account
                    </Button>         
                    <a href="/login"><Button variant="text">Cancel</Button></a>
                </form>
            </Box>
        </Container>
        </>
    );
};

export default SignUp;