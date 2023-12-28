import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useJamApi } from '../hooks/useJam';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components/Loading';

export const Jam: FC<{}> = () => {
  const navigate = useNavigate();
  let { jamId } = useParams();

  const { jamData, isLoading } = useJamApi({ jamId });
  console.log({ jamData });
  if (isLoading) {
    return <Loading />;
  }
  return <div>This is the Jam component! {jamId} ) !</div>;
};
