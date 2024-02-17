import {
  Button,
  Card,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import React, { ChangeEvent, useState } from 'react';
import { FC } from 'react';
import { SongCard, type SongCardParams } from '../../../components/SongCard';
import { debounce } from 'remeda';
import { ModalBody } from 'react-bootstrap';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { QueueItem, SetSongQueueParams } from '../../../hooks/useJam';

const getSongParams = (spotifyTrack: any): Omit<SongCardParams, 'onAdd'> => ({
  albumCoverUrl: spotifyTrack.album.images.at(-1).url,
  name: spotifyTrack.name,
  artist: spotifyTrack.artists[0].name,
  id: spotifyTrack.id,
  spotifyUri: spotifyTrack.uri,
});

export const SearchTab: FC<{
  jamId: string;
  setSongQueue: (songQueue: SetSongQueueParams) => void;
  onNewSong: (song: QueueItem) => void;
}> = ({ jamId, onNewSong }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<number[]>([]);
  const { isOpen, onOpen: showError, onClose } = useDisclosure();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    debouncedSearch.cancel();
    debouncedSearch.call(event.target.value);
  };

  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      return;
    }
    try {
      const response = await fetch(`/api/spotify/search?q=${query}&limit=8`);
      const data = await response.json();
      setResults(data.tracks.items.slice(0, 6));
    } catch (error) {
      console.error('Error fetching search results:', error);
    }
  };

  const debouncedSearch = debounce(handleSearch, {
    waitMs: 600,
    timing: 'leading',
  });

  const onAdd = async (song: Omit<SongCardParams, 'onAdd'>) => {
    const res = await fetch(`/api/jam/${jamId}/queue/song`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotifyUri: song.spotifyUri,
        name: song.name,
        artist: song.artist,
        imageUrl: song.albumCoverUrl,
      }),
    });

    if (res.status !== 201) {
      showError();
      return;
    }
    const newSong = await res.json();
    onNewSong(newSong);
  };

  return (
    <>
      <Input
        placeholder="Type Something..."
        focusBorderColor="pink.400"
        size="lg"
        variant="filled"
        onChange={handleInputChange}
        value={query}
        margin="0.8em"
      ></Input>
      {results.map((result, i: number) => {
        const { albumCoverUrl, artist, name, id, spotifyUri } =
          getSongParams(result);
        console.log({ albumCoverUrl });
        return (
          <Card variant="outline" padding="0.8em" margin="0.2em">
            <SongCard
              key={i.toString()}
              albumCoverUrl={albumCoverUrl}
              id={id}
              name={name}
              artist={artist}
              spotifyUri={spotifyUri}
              onAdd={onAdd}
            />
          </Card>
        );
      })}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody style={{ padding: '18px' }}>
            <WarningTwoIcon color="red.600" /> <b>Error - </b> unable to add
            song
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Bummer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
