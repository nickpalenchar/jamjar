import React, { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_INACTIVE_JAM, QueueItem, useJamApi } from '../../hooks/useJam';
import { Loading } from '../../components/Loading';
import { AiFillControl } from 'react-icons/ai';
import { FaRegListAlt as FaList } from 'react-icons/fa';
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
  Icon,
} from '@chakra-ui/react';
import { AddIcon, StarIcon } from '@chakra-ui/icons';
import { SearchTab } from './tabs/SearchTab';
import { JoinJamModal } from './modals/joinJamModal';
import { JamTab } from './tabs/JamTab';
import { MiniWorker } from './miniWorker';
import { AdminTab } from './tabs/AdminTab';
import { socket } from '../../socket';

export const Jam: FC<{}> = () => {
  // socket.io
  const [isConnected, setIsConnected] = useState(socket.connected);

  const { user, setUser, error, loading } = useContext(UserContext);
  let { jamId } = useParams();
  const [_, setMiniWorker] = useState<any>(null);

  const [{ jamData, isLoading, error: jamError }, setSongQueue] = useJamApi({
    jamId,
  });

  /* eslint-disable no-restricted-globals */
  const defaultTabIndex = Number.isNaN(parseInt(location.hash[1]))
    ? 0
    : parseInt(location.hash[1]);

  const [tabIndex, setTabIndex] = useState(defaultTabIndex);

  useEffect(() => {
    if (!jamData?.id) {
      return;
    }
    const worker = new MiniWorker(
      30,
      async () => {
        const res = await fetch(`/api/jam/${jamData?.id}/refreshOwnVibes`, {
          method: 'POST',
        });
        if (!res.ok) {
          console.error('Error refreshing vibes', await res.text());
          return;
        }
        const { updatedVibes } = await res.json();
        if (user?.userInJam) {
          setUser({
            ...user,
            ...{ userInJam: { ...user.userInJam, vibes: updatedVibes } },
          });
        }
      },
      { initial: true, id: 'jamWorker' },
    );
    setMiniWorker(worker);

    return () => {
      worker.terminate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jamData?.id]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      // XXX reconnection strategy;
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      if (jamData) {
        setSongQueue([
          ...value.data.updatedQueue.filter(
            (queueItem: QueueItem) => queueItem.id !== jamData?.nowPlaying?.id,
          ),
        ]);
      }
      // setFooEvents((previous: any) => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('put:songQueue', onFooEvent);
    socket.connect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('foo', onFooEvent);
    };
  }, [jamData, setSongQueue]);

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

  const onJoin = async () => {
    await fetch(`/api/jam/${jamId}/join`, {
      method: 'POST',
    });
    // TODO maybe set some state?
  };
  const onNewSong = (song: QueueItem) => {
    const updatedQueue = [song, ...jamData.queue]
      .sort((a, b) => (a.rank > b.rank ? 1 : -1))
      .filter((queueItem) => queueItem.id !== jamData.nowPlaying?.id);
    setSongQueue(updatedQueue);
    setTabIndex(isOwner ? 1 : 0);
  };

  const isOwner = user?.id === (jamData?.userId ?? Symbol());
  const isUserInJam = user.userInJam?.jamId === jamId || isOwner;

  const vibes = user.userInJam?.vibes ?? 0;
  const vibeColor = vibes > 1 ? 'white' : vibes === 1 ? 'red.100' : 'red.200';
  return (
    <>
      <Flex
        bgGradient="linear(to-r, #023788, #D40078)"
        w="100%"
        h="3em"
        marginBottom={'2em'}
        padding="8px"
      >
        <Center>
          <Image
            h="1.5em"
            src={process.env.PUBLIC_URL + '/jivelogo2-xs-light.webp'}
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
          isFitted
          onChange={(index: number) => setTabIndex(index)}
          index={tabIndex}
          defaultIndex={defaultTabIndex}
        >
          <TabList>
            {isOwner && (
              <Tab>
                <Icon as={AiFillControl} boxSize={6} margin="4px" />
                Controls
              </Tab>
            )}
            <Tab>
              <Icon as={FaList} boxSize={5} margin="4px" /> Board
            </Tab>
            <Tab>
              <AddIcon margin="4px" boxSize={5} /> Search
            </Tab>
          </TabList>

          <TabPanels>
            {isOwner && (
              <TabPanel>
                <AdminTab jamId={jamData.id} />
              </TabPanel>
            )}
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
            <TabPanel></TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
};
