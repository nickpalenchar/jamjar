import React, { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_INACTIVE_JAM, QueueItem, useJamApi } from '../../hooks/useJam';
import { Loading } from '../../components/Loading';
import { UserContext } from '../../context/Identity';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Container,
  Spacer,
  Flex,
  Center,
  Image,
} from '@chakra-ui/react';
import { AddIcon, StarIcon } from '@chakra-ui/icons';
import { SearchTab } from './tabs/SearchTab';
import { JoinJamModal } from './modals/joinJamModal';
import { JamTab } from './tabs/JamTab';
import { MiniWorker } from './miniWorker';

export const Jam: FC<{}> = () => {
  const { user, setUser, error, loading } = useContext(UserContext);
  let { jamId } = useParams();
  const [tabIndex, setTabIndex] = useState(0);
  const [miniWorker, setMiniWorker] = useState<any>(null);

  const [{ jamData, isLoading, error: jamError }, setSongQueue] = useJamApi({
    jamId,
  });

  useEffect(() => {
    if (!jamData?.id) {
      return;
    }
    const worker = new MiniWorker(
      5,
      async () => {
        console.log('got one call');
        const res = await fetch(`/api/jam/${jamData?.id}/refreshOwnVibes`, {
          method: 'POST',
        });
        if (!res.ok) {
          console.error('Error refreshing vibes', await res.text());
          return;
        }
        const { updatedVibes } = await res.json();
      },
      { initial: true, id: 'jamWorker' },
    );
    setMiniWorker(worker);

    return () => {
      worker.terminate();
    };
  }, [jamData?.id]);

  if (isLoading || loading || !jamData) {
    return <Loading />;
  }
  if (user === null) {
    if (error) {
      return <div>Something went wrong :/</div>;
    }
    return <div>Try reloading</div>;
  }
  if (jamError) {
    if (jamError === ERROR_INACTIVE_JAM) {
      return <div>Jam is no Longer active</div>;
    }
  }
  const isUserInJam = user.userInJam?.jamId === jamId;

  const onJoin = async () => {
    await fetch(`/api/jam/${jamId}/join`, {
      method: 'POST',
    });
    // TODO maybe set some state?
  };
  const onNewSong = (song: QueueItem) => {
    const updatedQueue = [song, ...jamData.queue].sort((a, b) =>
      a.rank > b.rank ? 1 : -1,
    );
    setSongQueue(updatedQueue);
    setTabIndex(0);
  };
  const vibes = user.userInJam?.vibes ?? 0;
  const vibeColor = vibes > 1 ? 'black' : vibes === 1 ? 'red.700' : 'red.600';
  return (
    <>
      <Flex bg="orange.100" w="100%" h="3em" marginBottom={'2em'} padding="8px">
        <Center>
          <Image
            h="1.5em"
            src={process.env.PUBLIC_URL + '/jivelogo2-xs.webp'}
          />
        </Center>
        <Spacer />
        <Center color={vibeColor}>
          <Text fontSize="lg">
            <b>{user.userInJam?.vibes}</b>
          </Text>
          {'  '}
          <StarIcon color={vibeColor} boxSize={4} margin={'0.15em'} />
        </Center>
      </Flex>
      <Container>
        {isUserInJam || <JoinJamModal onJoin={onJoin} />}

        <Tabs
          variant={'soft-rounded'}
          isFitted
          onChange={(index: number) => setTabIndex(index)}
          index={tabIndex}
        >
          <TabList>
            <Tab>🎙️ Board</Tab>
            <Tab>
              <AddIcon /> Search
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <JamTab jamData={jamData} setSongQueue={setSongQueue} />
            </TabPanel>
            <TabPanel>
              <SearchTab
                jamId={jamId ?? ''}
                setSongQueue={setSongQueue}
                onNewSong={onNewSong}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};
