import React, { useContext, useEffect } from 'react';
import { authContext } from '../../providers/auth';
import { useHistory } from 'react-router-dom';
import Template from '../../template/Index';
import { useToast, Box, Heading, Text } from "@chakra-ui/react";

import axios from 'axios';

export default function Home() {
    
    const { user, setUser } = useContext(authContext);
    const toast = useToast();
    const history = useHistory();

    useEffect(() => {
        axios({
            url: `${process.env.REACT_APP_DEV_BASE_URL}:${process.env.REACT_APP_DEV_PORT}/verification/token`,
            method: 'post',
            headers: {
                Authorization: "Bearer " +user.token
            }
        }).then(resp => {
            if (resp.data.message) {
                console.log("Authenticated success");
            } else {
                toast({
                    title: "Autenticação falhou",
                    description: "Token de validação expirado",
                    status: "error",
                    position: "top",
                    isClosable: true,
                    duration: 4000    
                });
                setUser({
                    idUser: '',
                    nameUser: '',
                    emailUser: '',
                    token: ''
                });
                
                localStorage.clear();

                history.push("/");
            }
        }).catch(err => {
            console.log(err);
            toast({
                title: "Autenticação falhou",
                description: "Token de validação expirado",
                status: "error",
                position: "top",
                isClosable: true,
                duration: 4000    
            });
            history.push("/");
        });
    }, [user, setUser, toast, history]);

    return (
        <Template>
            <Box
                bg="#9BC4BC55"
                w="80vw"
                h="60vh"
                marginTop="1.5rem"
                padding="1rem"
            >
                <Heading
                    size="lg"
                >
                    Bem vindo(a), {user.nameUser}
                </Heading>
                <Text
                    marginTop=".5rem"
                    fontSize="lg"
                >
                    Aproveite bem o nosso app de simulação de quiz
                </Text>
            </Box>
        </Template>
    );
}
