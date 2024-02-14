import { PlusSquareIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Image,
  Text,
  Card,
  Spacer,
  Button,
  Box,
} from '@chakra-ui/react';
import React, { FC } from 'react';
import { Container } from 'react-bootstrap';

export interface SongCardParams {
  /** id */
  id: string;
  /** items.images.at(-1) */
  albumCoverUrl: string;
  name: string;
  /** artists[0] */
  artist: string;
  spotifyUri: string;

  // other options
  onAdd?: (song: Omit<SongCardParams, 'onAdd'>) => void | Promise<void>;
}

export const SongCard: FC<SongCardParams> = ({
  albumCoverUrl,
  name,
  artist,
  id,
  spotifyUri,
  onAdd,
}) => {
  return (
    <Box>
      <Flex>
        <Center>
          <Image src={albumCoverUrl} boxSize="5em" alt="Album Cover" />
        </Center>
        <Flex direction="column" padding="0.8em">
          <Container>
            <Text as="b">{name}</Text>
          </Container>
          <Container>
            <Text>By {artist}</Text>
          </Container>
        </Flex>
        <Spacer />
        {onAdd && (
          <Button
            leftIcon={<PlusSquareIcon />}
            colorScheme="green"
            onClick={() =>
              onAdd({ id, albumCoverUrl, name, artist, spotifyUri })
            }
          >
            Add
          </Button>
        )}
      </Flex>
    </Box>
  );
};
