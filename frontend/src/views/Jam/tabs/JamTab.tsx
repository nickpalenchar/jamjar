import { Card, Flex, Heading, Text, VStack } from '@chakra-ui/react';
import React, { MouseEventHandler, ReactNode, useContext } from 'react';
import { FC } from 'react';
import { SongCard } from '../../../components/SongCard';
import { JamData, SetSongQueueParams } from '../../../hooks/useJam';
import { ChevronDownIcon, ChevronUpIcon, SunIcon } from '@chakra-ui/icons';
import { UserContext } from '../../../context/Identity';
import { Loading } from '../../../components/Loading';
import './banner.css';

interface VoteButtonParams {
  onClick: MouseEventHandler | null;
  icon: ReactNode;
}

const VoteButton: FC<VoteButtonParams> = ({ onClick, icon }) => (
  <div style={{ cursor: 'pointer' }} onClick={onClick ?? (() => {})}>
    {icon}
  </div>
);

export const JamTab: FC<{
  jamData: JamData;
  setSongQueue: (songQueue: SetSongQueueParams) => void;
}> = ({ jamData, setSongQueue }) => {
  // TODO state to prevent voting on multiple songs concurrently
  const { user, setUser } = useContext(UserContext);
  if (!user) {
    return <Loading />;
  }
  const handleUpvote = async (songId: string) => {
    const result = await fetch(`/api/jam/${jamData.id}/queue/${songId}/vote`, {
      method: 'PUT',
    });
    if (!result.ok) {
      //TODO render error
      return;
    }
    const { updatedQueue, userVibes } = await result.json();
    setSongQueue(updatedQueue);
    if (user.userInJam) {
      setUser({
        ...user,
        ...{ userInJam: { ...user.userInJam, vibes: userVibes } },
      });
    }
  };
  const handleDownvote = async (songId: string) => {
    const result = await fetch(
      `/api/jam/${jamData.id}/queue/${songId}/vote?direction=down`,
      {
        method: 'PUT',
      },
    );
    if (!result.ok) {
      //TODO render error
      return;
    }
    const { updatedQueue, userVibes } = await result.json();
    setSongQueue(updatedQueue);
    if (user.userInJam) {
      setUser({
        ...user,
        ...{ userInJam: { ...user.userInJam, vibes: userVibes } },
      });
    }
  };

  const InactiveCard = () => (
    <Card
      variant="outline"
      padding="0.8em"
      margin="0.2em"
      background="gray.200"
      borderColor={'gray.500'}
      borderWidth={'2px'}
    >
      <VStack alignContent={'center'} width={'100%'}>
        <Heading size="m">Jam has not started.</Heading>
        <Text>While you wait, vote on songs below ↓</Text>
        <Text>🥇 Highest voted plays first.</Text>
      </VStack>
    </Card>
  );

  return (
    <>
      {jamData.nowPlaying ? (
        <Card
          variant="outline"
          padding="0.8em"
          margin="0.2em"
          background=""
          className={'___jivebanner'}
          borderColor={'pink.400'}
          borderWidth={'2px'}
        >
          <Flex>
            <VStack paddingRight={'0.8em'}>
              <VoteButton
                icon={<ChevronUpIcon boxSize={6} color="gray.200" />}
                onClick={null}
              />
              <div>10</div>
              <VoteButton
                icon={<ChevronDownIcon boxSize={6} color="gray.200" />}
                onClick={null}
              />
            </VStack>
            <div>
              <SongCard
                albumCoverUrl={jamData.nowPlaying.albumImageUrl}
                id={jamData.nowPlaying.id}
                name={jamData.nowPlaying.name}
                artist={jamData.nowPlaying.artist}
                spotifyUri={jamData.nowPlaying.uri}
              />
            </div>
          </Flex>
        </Card>
      ) : (
        <InactiveCard />
      )}
      {jamData.queue.map((song, i: number) => {
        return (
          <Card variant="outline" padding="0.8em" margin="0.2em" key={song.id}>
            <Flex>
              <VStack paddingRight={'0.8em'}>
                <VoteButton
                  icon={<ChevronUpIcon boxSize={6} />}
                  onClick={() => handleUpvote(song.id)}
                />
                <div>{song.rank}</div>
                <VoteButton
                  icon={<ChevronDownIcon boxSize={6} />}
                  onClick={() => handleDownvote(song.id)}
                />
              </VStack>
              <div>
                <SongCard
                  key={i.toString()}
                  albumCoverUrl={song.imageUrl}
                  id={song.id}
                  name={song.name}
                  artist={song.artist}
                  spotifyUri={song.uri}
                />
              </div>
            </Flex>
          </Card>
        );
      })}
    </>
  );
};
