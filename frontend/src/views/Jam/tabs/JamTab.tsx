import { Box, Card, Flex, VStack } from '@chakra-ui/react';
import React, { MouseEventHandler, ReactNode, useContext } from 'react';
import { FC } from 'react';
import { SongCard } from '../../../components/SongCard';
import { JamData, SetSongQueueParams } from '../../../hooks/useJam';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { UserContext } from '../../../context/Identity';
import { Loading } from '../../../components/Loading';

interface VoteButtonParams {
  onClick: MouseEventHandler;
  icon: ReactNode;
}

const VoteButton: FC<VoteButtonParams> = ({ onClick, icon }) => (
  <div style={{ cursor: 'pointer' }} onClick={onClick}>
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

  return (
    <>
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
