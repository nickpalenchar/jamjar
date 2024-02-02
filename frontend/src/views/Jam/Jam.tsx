import React, { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_INACTIVE_JAM, useJamApi } from '../../hooks/useJam';
import { Loading } from '../../components/Loading';
import { UserContext } from '../../context/Identity';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Container,
  Input,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { SongCard } from '../../components/SongCard';

export const Jam: FC<{}> = () => {
  const identity = useContext(UserContext);
  let { jamId } = useParams();

  const { jamData, isLoading, error: jamError } = useJamApi({ jamId });
  if (isLoading || identity.loading) {
    return <Loading />;
  }
  if (identity.user === null) {
    if (identity.error) {
      return <div>Something went wrong :/</div>;
    }
    return <div>Try reloading</div>;
  }
  if (jamError) {
    if (jamError === ERROR_INACTIVE_JAM) {
      return <div>Jam is no Longer active</div>;
    }
  }
  return (
    <Container>
      <Tabs>
        <TabList>
          <Tab>🎙️ Board</Tab>
          <Tab>
            <AddIcon /> Search
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <h2>Board</h2>
            <div>
              <div>This is the Jam component! {jamId} ) !</div>
              <div>Hello, {identity.user.id}!</div>
              <div>Some data: {JSON.stringify(jamData)}</div>
            </div>
          </TabPanel>
          <TabPanel>
            <Input placeholder="Search..." size="lg" variant="flushed"></Input>
            <SongCard />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
