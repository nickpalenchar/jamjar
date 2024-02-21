import {
  Heading,
  VStack,
  Container,
  Link,
  Button,
  Center,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { FC } from 'react';
import { UserContext } from '../../../../context/Identity';
import { Loading } from '../../../../components/Loading';
import { QueueItem } from '../../../../hooks/useJam';
import { Spotify } from '../../../../clients/spotify';
import { CheckIcon } from '@chakra-ui/icons';
import { ErrorModal } from '../../../../components/errorModal';

interface AdminParams {
  jamId: string;
}

export const AdminTab: FC<AdminParams> = ({ jamId }) => {
  const [playerQueue, setPlayerQueue] = useState<
    QueueItem[] | null | 'unauthorized'
  >(null);
  const { user } = useContext(UserContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [errorMessage, setErrorMessage] = useState<{
    header: string;
    body: string;
  }>({ header: 'Error', body: 'idk wth happened.' });

  useEffect(() => {
    if (playerQueue !== null) {
      return;
    }
    Spotify.getPlayerQueue().then(({ error, data }) => {
      if (error) {
        return setPlayerQueue('unauthorized');
      }
      return setPlayerQueue(data?.queue ?? []);
    });
  });

  if (!user) {
    return <Loading />;
  }

  const handleStartJam = async () => {
    const res = await fetch(`/api/jam/${jamId}/start`, { method: 'post' });
    if (!res.ok) {
      console.log('setting error');
      setErrorMessage({
        header: "Couldn't start jam.",
        body: (await res.json()).error ?? 'idk wth happened.',
      });
      onOpen();
    }
  };

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
        <Button colorScheme="green" onClick={handleStartJam}>
          Start Jam
        </Button>
      );
    }
    if (playerQueue === null) {
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
    <>
      <VStack>
        <Heading>Player</Heading>
        <Container>hi</Container>
        <Center>{getSpotifyButton()}</Center>
      </VStack>
      <ErrorModal
        isOpen={isOpen}
        onClose={onClose}
        body={errorMessage.body}
        header={errorMessage.header}
      />
    </>
  );
};
