import React, { FC, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ERROR_INACTIVE_JAM, useJamApi } from '../../hooks/useJam';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { UserContext } from '../../context/Identity';

const handleErrors = (error: any) => {};

export const Jam: FC<{}> = () => {
  const navigate = useNavigate();
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
    <>
      <div>This is the Jam component! {jamId} ) !</div>
      <div>Hello, {identity.user.id}!</div>
    </>
  );
};
