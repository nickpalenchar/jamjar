import React, { FC } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_INACTIVE_JAM } from '../hooks/useJam';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { useJamLookup } from '../hooks/useJam/useJamLookup';

export const JamLookup: FC<{}> = () => {
  const navigate = useNavigate();
  let { phrase } = useParams();

  const { jamId, isLoading, error: jamError } = useJamLookup({ phrase });
  if (isLoading) {
    return <Loading />;
  }
  if (jamError) {
    if (jamError === ERROR_INACTIVE_JAM) {
      return <div>Jam is no Longer active</div>;
    }
  }
  navigate(`/jam/${jamId}`);
  return <Loading />;
};
