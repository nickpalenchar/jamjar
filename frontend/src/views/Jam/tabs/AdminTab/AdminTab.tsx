import {
  Text,
  Heading,
  VStack,
  Container,
  Link,
  Button,
} from '@chakra-ui/react';
import React, {
  MouseEventHandler,
  ReactNode,
  useContext,
  useEffect,
} from 'react';
import { FC } from 'react';
import { UserContext } from '../../../../context/Identity';
import { Loading } from '../../../../components/Loading';

interface AdminParams {
  jamId: string;
}

export const AdminTab: FC<AdminParams> = ({ jamId }) => {
  // TODO state to prevent voting on multiple songs concurrently
  const { user, setUser } = useContext(UserContext);
  if (!user) {
    return <Loading />;
  }

  return (
    <VStack>
      <Heading>Player</Heading>
      <Container>hi</Container>
      <Text>
        <Link href={'/api/spotify/authorize?jamId=' + jamId}>
          <Button colorScheme="whatsapp">Link your Spotify Account</Button>
        </Link>
      </Text>
    </VStack>
  );
};
