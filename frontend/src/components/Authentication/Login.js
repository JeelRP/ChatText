import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from "@chakra-ui/react";

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast()
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleClick = () => setShow(!show);

  const submitHandler = async (pics) => {
    setLoading(true)
    if (!email || !password ) {
      toast({
        title: "Please Fill all the Feilds!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      })
      setLoading(false)
      return;
    }
    
    try {
      const config = {
        header: {
          "Content-Type": "application/json"
        }
      }
      const { data } = await axios.post('/api/user/login',
        { email, password },
        config);
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      })
      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false)
      navigate('/chats')
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      })
      setLoading(false)
    }
  };
  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "type" : "password"}
            placeholder="Enter Your Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          <InputRightElement w="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="blue"
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
      <Button
        variant="solid"
        colorScheme="red"
        width={"100%"}
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
};

export default Login;

