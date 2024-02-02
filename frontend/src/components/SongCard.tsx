import { PlusSquareIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Box,
  Image,
  Text,
  Card,
  Spacer,
  Button,
} from '@chakra-ui/react';
import React, { FC, useState } from 'react';
import { Container } from 'react-bootstrap';

interface SongCardParams {
  /** id */
  id: string;
  /** items.images.at(-1) */
  albumCoverUrl: string;
  name: string;
  /** artists[0] */
  artist: string;
}

export const SongCard: FC<{}> = () => {
  const albumCoverUrl =
    'https://i.scdn.co/image/ab67616d00001e022ab64fd86c12f2ba7df9c446';
  return (
    <Card variant="outline" padding="0.8em">
      <Flex>
        <Center>
          <Image src={albumCoverUrl} boxSize="5em" alt="Album Cover" />
        </Center>
        <Flex direction="column" padding="0.8em">
          <Container>
            <Text as="b">Hello</Text>
          </Container>
          <Container>
            <Text>By whomever</Text>
          </Container>
        </Flex>
        <Spacer />
        <Button leftIcon={<PlusSquareIcon />} colorScheme="green">
          Add
        </Button>
      </Flex>
    </Card>
  );
};
