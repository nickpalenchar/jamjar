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
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { SearchTab } from './tabs/SearchTab';
import { JoinJamModal } from './modals/joinJamModal';
import { sessionFetch } from '../../network/sessionFetch';
import { JamTab } from './tabs/JamTab';

export const Jam: FC<{}> = () => {
  const identity = useContext(UserContext);
  let { jamId } = useParams();

  const { jamData, isLoading, error: jamError } = useJamApi({ jamId });
  if (isLoading || identity.loading || !jamData) {
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
  const isUserInJam = identity.user.userInJam?.jamId === jamId;

  const onJoin = async () => {
    await sessionFetch(`/api/jam/${jamId}/join`, {
      method: 'POST',
    });
    // TODO maybe set some state?
  };
  console.log({ jamData });
  return (
    <Container>
      {isUserInJam || <JoinJamModal onJoin={onJoin} />}

      <Tabs>
        <TabList>
          <Tab>🎙️ Board</Tab>
          <Tab>
            <AddIcon /> Search
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <JamTab jamData={jamData} />
          </TabPanel>
          <TabPanel>
            <SearchTab jamId={jamId ?? ''} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};
