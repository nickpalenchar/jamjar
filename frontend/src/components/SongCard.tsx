import { PlusSquareIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Image,
  Text,
  Card,
  Spacer,
  Button,
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

  // other options
  onAdd?: (spotifyUri: string) => void | Promise<void>;
}

export const SongCard: FC<SongCardParams> = ({
  albumCoverUrl,
  name,
  artist,
  id,
  onAdd,
}) => {
  return (
    <Card variant="outline" padding="0.8em">
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
            onClick={() => onAdd(id)}
          >
            Add
          </Button>
        )}
      </Flex>
    </Card>
  );
};
