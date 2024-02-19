import {
  Text,
  Heading,
  VStack,
  Container,
  Link,
  Button,
  Center,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { FC } from 'react';
import { UserContext } from '../../../../context/Identity';
import { Loading } from '../../../../components/Loading';
import { QueueItem } from '../../../../hooks/useJam';
import { Spotify } from '../../../../clients/spotify';
import { CheckIcon } from '@chakra-ui/icons';

interface AdminParams {
  jamId: string;
}

export const AdminTab: FC<AdminParams> = ({ jamId }) => {
  const [playerQueue, setPlayerQueue] = useState<
    QueueItem[] | null | 'unauthorized'
  >(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (playerQueue !== null) {
      return;
    }
    Spotify.getPlayerQueue().then(({ error, data }) => {
      console.log('got this back', { error, data });
      if (error) {
        return setPlayerQueue('unauthorized');
      }
      return setPlayerQueue(data?.queue ?? []);
    });
  });

  if (!user) {
    return <Loading />;
  }

  const getSpotifyButton = () => {
    console.log({ playerQueue });
    if (playerQueue === 'unauthorized') {
      return (
        <Link href={'/api/spotify/authorize?jamId=' + jamId}>
          <Button colorScheme="pink">Link your Spotify Account</Button>
        </Link>
      );
    }
    if (playerQueue) {
      return (
        <Button
          colorScheme="green"
          disabled={true}
          leftIcon={<CheckIcon color={'greenyellow'} />}
        >
          Connected to Spotify!
        </Button>
      );
    }
    if (playerQueue === null) {
      console.log('return nutl lll');
      return (
        <Button
          colorScheme="green"
          isLoading
          loadingText="Connecting to Spotify..."
        ></Button>
      );
    }
  };

  return (
    <VStack>
      <Heading>Player</Heading>
      <Container>hi</Container>
      <Center>{getSpotifyButton()}</Center>
    </VStack>
  );
};
