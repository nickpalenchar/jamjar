import { useNavigate } from 'react-router-dom';
// import useUser from "../auth/identity";
// import Loading from "../components/Loading";
import {
  Input,
  Heading,
  Container,
  InputGroup,
  Button,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import React, { FC, useEffect, useRef, useState } from 'react';

export const SelectAJam: FC<{}> = () => {
  const navigate = useNavigate();
  const firstInput = useRef<HTMLInputElement>(null);
  const secondInput = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    const word1 = firstInput.current?.value.replace(/[\s-.,;]/g, '');
    const word2 = secondInput.current?.value.replace(/[\s-.,;]/g, '');
    console.log([word1, word2]);
    const res = await fetch(`/api/jam/phrase/${word1}-${word2}`);
    if (!res.ok) {
      setIsLoading(false);
      if (res.status === 404 || res.status === 410) {
        return setErrorMessage("Can't find that jam, brah.");
      }
      setErrorMessage('Something went sideways :(');
    }
    const { jamId } = await res.json();
    window.location.href = `/jam/${jamId}`;
  };
  const onKeyDown1 = (event: any) => {
    setErrorMessage(null);
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      secondInput.current?.focus();
    }
  };
  const onKeyDown2 = (event: any) => {
    setErrorMessage(null);
    if (event.key === 'Backspace') {
      if (event.target.value === '') {
        firstInput.current?.focus();
      }
    }
    if (event.key === 'Enter') {
      handleClick();
    }
  };

  useEffect(() => {
    if (firstInput.current) {
      firstInput.current.focus();
    }
  }, []);

  return (
    <Container>
      <Stack spacing={3}>
        <Heading>Find your Jam</Heading>
        <InputGroup>
          <Input
            type="text"
            variant="outline"
            placeholder="Shining"
            onKeyDown={onKeyDown1}
            width={'10em'}
            focusBorderColor="pink.400"
            ref={firstInput}
          />
          <Input
            width={'10em'}
            onKeyDown={onKeyDown2}
            placeholder="pearl"
            focusBorderColor="pink.400"
            ref={secondInput}
          />
          <Button
            marginLeft={'0.5em'}
            size="md"
            colorScheme="pink"
            width={'6em'}
            isLoading={isLoading}
            loadingText="one sec"
            onClick={handleClick}
          >
            Find!
          </Button>
        </InputGroup>
        {errorMessage && (
          <Alert status="error" maxWidth={'20em'}>
            <AlertIcon />
            <AlertTitle>{errorMessage}</AlertTitle>
          </Alert>
        )}
      </Stack>
    </Container>
  );
};
